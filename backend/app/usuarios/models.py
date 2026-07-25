import uuid
from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser

class EstadoUsuario(models.TextChoices):
    PENDIENTE = 'pendiente_aprobacion', 'Pendiente de aprobación'
    APROBADO = 'aprobado', 'Aprobado'
    RECHAZADO = 'rechazado', 'Rechazado'


class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(
        max_length=50,
        unique=True
    )
    descripcion = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.nombre


class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(
        max_length=150,
        unique=True,
    )
    email = models.EmailField(
        unique=True
    )
    documento = models.CharField(
        max_length=20,
        unique=True
    )
    documento_identidad = models.CharField(max_length=20, blank=True, default='')
    telefono = models.CharField(
        max_length=20,
        blank=True
    )
    foto = models.ImageField(
        upload_to="usuarios/",
        null=True,
        blank=True
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoUsuario.choices,
        default=EstadoUsuario.APROBADO,
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    
    def __str__(self):
        return self.email


class Notificacion(models.Model):
    class TipoNotificacion(models.TextChoices):
        SOLICITUD_CREADA = 'solicitud_creada', 'Solicitud Creada'
        SOLICITUD_APROBADA = 'solicitud_aprobada', 'Solicitud Aprobada'
        SOLICITUD_RECHAZADA = 'solicitud_rechazada', 'Solicitud Rechazada'
        PAGO_CONFIRMADO = 'pago_confirmado', 'Pago Confirmado'
        EXAMEN_AGENDADO = 'examen_agendado', 'Examen Agendado'
        EXAMEN_CALIFICADO = 'examen_calificado', 'Examen Calificado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=30, choices=TipoNotificacion.choices)
    leido = models.BooleanField(default=False)
    supletorio = models.ForeignKey(
        'supletorios.Supletorio',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='notificaciones'
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f'{self.tipo}: {self.titulo} ({self.usuario})'