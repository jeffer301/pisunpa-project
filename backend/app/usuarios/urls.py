from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AprobarEstudianteView,
    CustomTokenObtainPairView,
    EstudiantesPendientesView,
    NotificacionContarNoLeidasView,
    NotificacionLeerTodasView,
    NotificacionListView,
    NotificacionMarcarLeidaView,
    RegistroConRolView,
    RegistroDocenteView,
    RegistroView,
    RechazarEstudianteView,
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
    path(
        "registro-docente/",
        RegistroDocenteView.as_view(),
        name="registro-docente",
    ),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path(
        "disponibles/",
        UsuariosDisponiblesView.as_view(),
        name="usuarios-disponibles",
    ),
    path(
        "estudiantes-pendientes/",
        EstudiantesPendientesView.as_view(),
        name="estudiantes-pendientes",
    ),
    path(
        "usuarios/<uuid:pk>/aprobar/",
        AprobarEstudianteView.as_view(),
        name="aprobar-estudiante",
    ),
    path(
        "usuarios/<uuid:pk>/rechazar/",
        RechazarEstudianteView.as_view(),
        name="rechazar-estudiante",
    ),
    path("notificaciones/", NotificacionListView.as_view(), name="notificaciones-list"),
    path("notificaciones/contar-no-leidas/", NotificacionContarNoLeidasView.as_view(), name="notificaciones-contar"),
    path("notificaciones/<uuid:pk>/leer/", NotificacionMarcarLeidaView.as_view(), name="notificaciones-leer"),
    path("notificaciones/leer-todas/", NotificacionLeerTodasView.as_view(), name="notificaciones-leer-todas"),
]
