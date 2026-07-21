from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.exceptions import ObjectDoesNotExist

from .models import Departamento, Ciudad, Programa, PerfilEgresado
from .serializers import (
    DepartamentoSerializer, CiudadSerializer, ProgramaSerializer,
    PerfilEgresadoReadSerializer, PerfilEgresadoWriteSerializer
)
from .services import EgresadoService

# Se preservan las clases de consulta pública que implementó su compañero
class ProgramaListView(generics.ListAPIView):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
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