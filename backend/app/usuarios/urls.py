from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from .views import (
    RegistroConRolView,
    RegistroView,
    PerfilView,
    UsuariosDisponiblesView,
)

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path(
        "registro-con-rol/",
        RegistroConRolView.as_view(),
        name="registro-con-rol",
    ),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "disponibles/",
        UsuariosDisponiblesView.as_view(),
        name="usuarios-disponibles",
    ),
]
