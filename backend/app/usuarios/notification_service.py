from django.db.models import QuerySet
from .models import Notificacion, Rol, Usuario


class NotificacionService:
    @staticmethod
    def crear(usuario: Usuario, titulo: str, mensaje: str, tipo: str,
              supletorio=None, evento=None,
              roles_broadcast: list | None = None) -> Notificacion:
        if roles_broadcast is None:
            roles_broadcast = ['secretario']

        notificacion = Notificacion.objects.create(
            usuario=usuario,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            supletorio=supletorio,
            evento=evento,
        )

        roles = Rol.objects.filter(nombre__in=roles_broadcast)
        destinatarios = (
            Usuario.objects
            .filter(rol__in=roles, estado='aprobado')
            .exclude(id=usuario.id)
            .distinct()
        )
        for destinatario in destinatarios:
            Notificacion.objects.create(
                usuario=destinatario,
                titulo=titulo,
                mensaje=mensaje,
                tipo=tipo,
                supletorio=supletorio,
                evento=evento,
            )
        return notificacion

    @staticmethod
    def marcar_como_leida(notificacion_id: str, usuario: Usuario) -> bool:
        updated = Notificacion.objects.filter(
            id=notificacion_id, usuario=usuario
        ).update(leido=True)
        return updated > 0

    @staticmethod
    def contar_no_leidas(usuario: Usuario) -> int:
        return Notificacion.objects.filter(usuario=usuario, leido=False).count()

    @staticmethod
    def obtener_notificaciones(usuario: Usuario, solo_no_leidas: bool = False) -> QuerySet:
        qs = Notificacion.objects.filter(usuario=usuario)
        if solo_no_leidas:
            qs = qs.filter(leido=False)
        return qs
