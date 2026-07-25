from django.db import transaction
from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAuthenticated,
)
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from app.egresados.models import PerfilEgresado, Programa
from .models import Rol, Usuario
from .serializers import (
    CustomTokenObtainSerializer,
    EstudiantePendienteSerializer,
    RegistroConRolSerializer,
    RegistroDocenteSerializer,
    RegistroSerializer,
    UsuariosDisponiblesSerializer,
    UsuarioSerializer,
)


class RegistroConRolView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroConRolSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            usuario = Usuario(
                username=data["email"],
                email=data["email"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                documento=data["documento"],
                documento_identidad=data.get("documento_identidad", ""),
                telefono=data.get("telefono", ""),
            )
            usuario.set_password(data["password"])

            if data["tipo_usuario"] == "estudiante":
                usuario.estado = "pendiente_aprobacion"

            usuario.save()

            if data["tipo_usuario"] == "egresado":
                programa = Programa.objects.get(
                    id=data["programa_id"]
                )
                PerfilEgresado.objects.create(
                    usuario=usuario,
                    tipo_documento="CC",
                    numero_documento=data["documento"],
                    telefono_celular=data.get("telefono", ""),
                    direccion_residencia=data.get(
                        "direccion_residencia", ""
                    ),
                    biografia=data.get("biografia", ""),
                    programa=programa,
                    validado=False,
                )

        return Response(
            {
                "mensaje": (
                    "Registro como egresado pendiente de "
                    "validación."
                    if data["tipo_usuario"] == "egresado"
                    else "Tu cuenta está pendiente de aprobación "
                    "por el director/administrador."
                )
            },
            status=status.HTTP_201_CREATED,
        )


class RegistroView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]


class PerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UsuarioSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'rol', None)
            and request.user.rol.nombre
            in ('administrador', 'director', 'secretario')
        )


class UsuariosDisponiblesView(generics.ListAPIView):
    serializer_class = UsuariosDisponiblesSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        usuario_ids_con_perfil = PerfilEgresado.objects.values_list(
            'usuario_id', flat=True
        )
        return Usuario.objects.exclude(id__in=usuario_ids_con_perfil)


class RegistroDocenteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroDocenteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            usuario = Usuario(
                username=data["email"],
                email=data["email"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                documento=data["documento_identidad"],
                documento_identidad=data["documento_identidad"],
            )
            usuario.set_password(data["password"])
            usuario.rol = Rol.objects.get(nombre='profesor')
            usuario.estado = 'aprobado'
            usuario.save()

        return Response(
            {"mensaje": "Registro exitoso. Ya puedes iniciar sesión."},
            status=status.HTTP_201_CREATED,
        )


class EstudiantesPendientesView(generics.ListAPIView):
    serializer_class = EstudiantePendienteSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return Usuario.objects.filter(estado='pendiente_aprobacion').order_by('-creado')


class AprobarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        usuario.estado = 'aprobado'
        usuario.save()
        return Response({"mensaje": "Estudiante aprobado correctamente"})


class RechazarEstudianteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        try:
            usuario = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        usuario.estado = 'rechazado'
        usuario.save()
        return Response({"mensaje": "Estudiante rechazado"})
