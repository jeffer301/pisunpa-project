from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Departamento, Ciudad, Programa, Asignatura, PerfilEgresado, ProfesorAsignatura
from .serializers import (
    DepartamentoSerializer, CiudadSerializer, ProgramaSerializer, AsignaturaSerializer,
    PerfilEgresadoReadSerializer, PerfilEgresadoWriteSerializer,
    ProfesorAsignaturaSerializer, ProfesorAsignaturaWriteSerializer
)
from .services import EgresadoService

User = get_user_model()

# Se preservan las clases de consulta pública que implementó su compañero
class ProgramaListView(generics.ListAPIView):
    queryset = Programa.objects.all().order_by('nombre').distinct()
    serializer_class = ProgramaSerializer
    permission_classes = [AllowAny]


class AsignaturaListView(generics.ListAPIView):
    queryset = Asignatura.objects.all()
    serializer_class = AsignaturaSerializer
    permission_classes = [AllowAny]

class DepartamentoListView(generics.ListAPIView):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer
    permission_classes = [AllowAny]

class CiudadListView(generics.ListAPIView):
    serializer_class = CiudadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Ciudad.objects.all()
        id_departamento = self.request.query_params.get('idDepartamento')
        if id_departamento:
            queryset = queryset.filter(departamento_id=id_departamento)
        return queryset

# --- Nuevo PerfilEgresadoViewSet ---

class PerfilEgresadoViewSet(viewsets.ModelViewSet):
    queryset = PerfilEgresado.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'mi_perfil']:
            return PerfilEgresadoReadSerializer
        return PerfilEgresadoWriteSerializer

    def perform_create(self, serializer):
        user = self.request.user
        is_admin = getattr(user, 'rol', None) and getattr(
            user.rol, 'nombre', ''
        ) in ('administrador', 'director', 'secretario')

        if is_admin:
            usuario_id = serializer.validated_data.get('usuario_id')
            if usuario_id:
                usuario = User.objects.get(id=usuario_id)
            else:
                from app.usuarios.models import Rol
                num_doc = serializer.validated_data.get(
                    'numero_documento', ''
                )
                rol_egresado = Rol.objects.get(nombre='egresado')
                usuario = User.objects.create_user(
                    username=f"egresado_{num_doc}",
                    email=f"egresado_{num_doc}@pisunpa.local",
                    password='cambiar123',
                    documento=num_doc,
                    rol=rol_egresado,
                )
            serializer.save(usuario=usuario)
        else:
            serializer.save(usuario=user)

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def mi_perfil(self, request):
        """
        Obtiene o actualiza el perfil del egresado autenticado actualmente.
        """
        user = request.user
        if request.method == 'GET':
            try:
                perfil = EgresadoService.obtener_perfil_completo(user)
                serializer = PerfilEgresadoReadSerializer(perfil)
                return Response(serializer.data)
            except ObjectDoesNotExist as e:
                return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

        elif request.method in ['PUT', 'PATCH']:
            serializer = PerfilEgresadoWriteSerializer(data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            
            perfil_actualizado = EgresadoService.actualizar_perfil(user, serializer.validated_data)
            perfil_completo = EgresadoService.obtener_perfil_completo(user)
            
            response_serializer = PerfilEgresadoReadSerializer(perfil_completo)
            return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='importacion-masiva')
    def importacion_masiva(self, request):
        """
        Lanza el proceso de importación masiva por lote utilizando Celery.
        """
        archivo_id_o_ruta = request.data.get("archivo_ruta", "media/uploads/egresados.xlsx")
        
        # Delegar la tarea al servicio para disparar la ejecución asíncrona
        tarea_id = EgresadoService.lanzar_importacion_masiva(archivo_id_o_ruta)
        
        return Response({
            "mensaje": "Proceso de importación en segundo plano iniciado exitosamente.",
            "task_id": tarea_id
        }, status=status.HTTP_202_ACCEPTED)

    @action(
        detail=True, methods=['post'],
        permission_classes=[IsAuthenticated]
    )
    def validar(self, request, pk=None):
        perfil = self.get_object()
        user = request.user

        is_admin = getattr(user, 'rol', None) and getattr(
            user.rol, 'nombre', ''
        ) in ('administrador', 'director', 'secretario')
        if not is_admin:
            return Response(
                {'detail': 'Solo administradores pueden validar egresados.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if perfil.validado:
            return Response(
                {'detail': 'Este egresado ya está validado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from app.usuarios.models import Rol
        with transaction.atomic():
            perfil.validado = True
            perfil.save(update_fields=['validado'])

            rol_egresado = Rol.objects.get(nombre='egresado')
            perfil.usuario.rol = rol_egresado
            perfil.usuario.save(update_fields=['rol'])

        return Response(
            {'detail': 'Egresado validado exitosamente.'}
        )


class ProfesorAsignaturaViewSet(viewsets.ModelViewSet):
    queryset = ProfesorAsignatura.objects.select_related('profesor', 'asignatura').all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProfesorAsignaturaSerializer
        return ProfesorAsignaturaWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pa = ProfesorAsignatura.objects.create(
            profesor_id=serializer.validated_data['profesor_id'],
            asignatura_id=serializer.validated_data['asignatura_id'],
        )
        return Response(
            ProfesorAsignaturaSerializer(pa).data,
            status=status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
