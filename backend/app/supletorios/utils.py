from django.core.mail import send_mail
from django.conf import settings


def enviar_correo(destinatario: str, asunto: str, mensaje: str) -> None:
    if not destinatario:
        return
    send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [destinatario], fail_silently=True)