from django.db import models
from django.utils import timezone


class EstadoSupletorio(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    EN_REVISION = 'en_revision', 'En revisión'
    APROBADA = 'aprobada', 'Aprobada'
    RECHAZADA = 'rechazada', 'Rechazada'
    FORMATO_PENDIENTE = 'formato_pendiente', 'Formato pendiente'
    COMPROBANTE_SUBIDO = 'comprobante_subido', 'Comprobante subido'
    NOTIFICADO_PROFESOR = 'notificado_profesor', 'Notificado al profesor'
    REALIZADO = 'realizado', 'Realizado'


class Supletorio(models.Model):
    DIAS_LIMITE = 5

    # Estudiante: campos planos hasta que exista el modelo Usuario (módulo de Duvan)
    estudiante_nombre = models.CharField(max_length=150)
    estudiante_email = models.EmailField()

    fecha_parcial = models.DateField()
    fecha_solicitud = models.DateField(default=timezone.localdate)

    profesor = models.CharField(max_length=150)
    asignatura = models.CharField(max_length=150)
    grupo = models.CharField(max_length=50)

    id_programa = models.IntegerField()
    programa_nombre = models.CharField(max_length=150, blank=True)

    descripcion = models.TextField()
    nota_revision = models.TextField(blank=True, default='')

    estado = models.CharField(max_length=30, choices=EstadoSupletorio.choices, default=EstadoSupletorio.PENDIENTE)

    comprobante_pago = models.FileField(upload_to='comprobantes_pago/', null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def excede_plazo(self):
        return (self.fecha_solicitud - self.fecha_parcial).days > self.DIAS_LIMITE

    def __str__(self):
        return f'{self.estudiante_nombre} - {self.asignatura} ({self.estado})'


class AnexoSupletorio(models.Model):
    supletorio = models.ForeignKey(Supletorio, related_name='anexos', on_delete=models.CASCADE)
    archivo = models.FileField(upload_to='anexos_supletorios/')
    subido_en = models.DateTimeField(auto_now_add=True)
