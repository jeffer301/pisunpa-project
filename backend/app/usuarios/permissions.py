from rest_framework.permissions import BasePermission, IsAuthenticated


ROL_DIRECTOR = 'director'
ROL_ADMIN = 'administrador'
ROL_SECRETARIO = 'secretario'
ROL_COORDINADOR = 'coordinador'
ROL_EGRESADO = 'egresado'
ROL_PROFESOR = 'profesor'
ROL_ESTUDIANTE = 'estudiante'

ADMIN_LECTURA = (ROL_ADMIN, ROL_DIRECTOR, ROL_SECRETARIO)
ADMIN_ESCRITURA = (ROL_ADMIN, ROL_DIRECTOR)
COORDINADOR_EGRESADOS = (ROL_COORDINADOR, ROL_ADMIN, ROL_DIRECTOR)


def rol_de(user):
    if not user or not getattr(user, 'rol', None):
        return None
    return user.rol.nombre


def es_admin_lectura(user):
    rol = rol_de(user)
    return rol in ADMIN_LECTURA


def es_admin_escritura(user):
    rol = rol_de(user)
    return rol in ADMIN_ESCRITURA


def es_coordinador(user):
    rol = rol_de(user)
    return rol in COORDINADOR_EGRESADOS


class EsAutenticado(IsAuthenticated):
    pass


class EsAdminLectura(BasePermission):
    message = 'No tienes permiso para consultar esta información.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and es_admin_lectura(request.user)
        )


class EsAdminEscritura(BasePermission):
    message = 'Solo administradores y director pueden realizar esta acción.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and es_admin_escritura(request.user)
        )


class EsCoordinadorEgresados(BasePermission):
    message = 'Solo el coordinador de egresados, administrador o director pueden realizar esta acción.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and es_coordinador(request.user)
        )


def es_superadmin(user):
    return rol_de(user) == ROL_DIRECTOR


def puede_tocar_usuario(solicitante, usuario):
    """¿Puede `solicitante` modificar el rol de `usuario`? Cuentas admin/director solo director."""
    if es_superadmin(solicitante):
        return True
    if usuario.rol and usuario.rol.nombre in (ROL_ADMIN, ROL_DIRECTOR):
        return False
    return True


def puede_asignar_rol(solicitante, rol):
    """¿Puede `solicitante` asignar el rol `rol` a otro usuario?"""
    if rol == ROL_DIRECTOR:
        return False
    if rol == ROL_ADMIN and not es_superadmin(solicitante):
        return False
    return True
