from django.db.models import QuerySet
from .models import Notificacion, Usuario


class NotificacionService:
    @staticmethod
    def crear(usuario: Usuario, titulo: str, mensaje: str, tipo: str, supletorio=None) -> Notificacion:
        return Notificacion.objects.create(
            usuario=usuario,
            titulo=titulo,
            mensaje=mensaje,
            tipo=tipo,
            supletorio=supletorio,
        )

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
