from rest_framework.permissions import (
    AllowAny,
    BasePermission,
    IsAuthenticated,
)
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response

from app.egresados.models import PerfilEgresado
from .models import Usuario
from .serializers import (
    RegistroSerializer,
    UsuariosDisponiblesSerializer,
    UsuarioSerializer,
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
