import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    documento = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    foto = models.ImageField(upload_to='usuarios/fotos/', blank=True, null=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)
    documento_identidad = models.CharField(max_length=20, blank=True, default='')

    ESTADO_CHOICES = [
        ('pendiente_aprobacion', 'Pendiente de aprobación'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]
    estado = models.CharField(
        max_length=20, choices=ESTADO_CHOICES, default='aprobado'
    )

    rol = models.ForeignKey(
        'Rol', on_delete=models.SET_NULL, null=True, blank=True
    )

    objects = UserManager()

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'


class Rol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.nombre


class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('solicitud_creada', 'Solicitud Creada'),
        ('solicitud_aprobada', 'Solicitud Aprobada'),
        ('solicitud_rechazada', 'Solicitud Rechazada'),
        ('pago_confirmado', 'Pago Confirmado'),
        ('examen_agendado', 'Examen Agendado'),
        ('examen_calificado', 'Examen Calificado'),
        ('evento_creado', 'Evento Creado'),
        ('evento_inscripcion', 'Inscripción a Evento'),
        ('evento_cancelacion', 'Cancelación de Inscripción'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    leido = models.BooleanField(default=False)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones',
    )
    supletorio = models.ForeignKey(
        'supletorios.Supletorio',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones',
    )
    evento = models.ForeignKey(
        'egresados.Evento',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notificaciones',
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f'{self.titulo} — {self.usuario.email}'


class InvitacionDocente(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invitaciones',
    )
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    usado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    expiracion = models.DateTimeField()

    class Meta:
        ordering = ['-creado_en']

    def save(self, *args, **kwargs):
        if not self.expiracion:
            self.expiracion = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def valido(self) -> bool:
        return not self.usado and self.expiracion > timezone.now()

    def __str__(self):
        estado = 'Usada' if self.usado else 'Válida'
        return f'Invitación para {self.email} — {estado}'
