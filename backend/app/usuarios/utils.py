from django.core.mail import send_mail
from django.conf import settings


def enviar_correo(destinatario: str, asunto: str, mensaje: str) -> None:
    if not destinatario:
        return
    send_mail(asunto, mensaje, settings.DEFAULT_FROM_EMAIL, [destinatario], fail_silently=True)


def enviar_invitacion_docente(email: str, nombre: str, token: str) -> None:
    enlace = f'{settings.FRONTEND_URL}/registro/docente?token={token}'
    asunto = 'Invitación a Plataforma PISUNPA — Universidad del Pacífico'
    mensaje = (
        f'Hola {nombre},\n\n'
        f'Has sido registrado como docente en el sistema PISUNPA de la Universidad del Pacífico.\n\n'
        f'Para completar tu registro, haz clic en el siguiente enlace:\n{enlace}\n\n'
        f'Este enlace es de un solo uso y expira en 7 días.\n\n'
        f'Atentamente,\n'
        f'Universidad del Pacífico — Buenaventura'
    )
    enviar_correo(email, asunto, mensaje)
