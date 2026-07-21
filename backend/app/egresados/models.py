import uuid
from django.db import models
from django.conf import settings

class Departamento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Ciudad(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=100)
    departamento = models.ForeignKey(Departamento, related_name='ciudades', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre

class Programa(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=150)

    def __str__(self):
        return self.nombre

class PerfilEgresado(models.Model):
    TIPO_DOC_CHOICES = [
        ('CC', 'Cédula de Ciudadanía'),
        ('TI', 'Tarjeta de Identidad'),
        ('CE', 'Cédula de Extranjería'),
        ('PAS', 'Pasaporte'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='perfil_egresado'
    )
    tipo_documento = models.CharField(max_length=5, choices=TIPO_DOC_CHOICES, default='CC')
    numero_documento = models.CharField(max_length=20, unique=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    telefono_celular = models.CharField(max_length=20, blank=True)
    direccion_residencia = models.CharField(max_length=255, blank=True)
    biografia = models.TextField(blank=True)
    trabaja_actualmente = models.BooleanField(default=False)
    
    # Relación con catálogos (con UUID)
    programa = models.ForeignKey(Programa, on_delete=models.PROTECT, null=True, blank=True)
    departamento = models.ForeignKey(Departamento, on_delete=models.SET_NULL, null=True, blank=True)
    ciudad = models.ForeignKey(Ciudad, on_delete=models.SET_NULL, null=True, blank=True)

    # Campos de contacto de emergencia exigidos en el requerimiento (pág 20)
    contacto_emergencia_nombre = models.CharField(max_length=150, blank=True)
    contacto_emergencia_parentesco = models.CharField(max_length=100, blank=True)
    contacto_emergencia_telefono = models.CharField(max_length=20, blank=True)
    contacto_emergencia_email = models.EmailField(blank=True)

    def __str__(self):
        return f"{self.usuario.get_full_name()} - Doc: {self.numero_documento}"

class ExperienciaLaboral(models.Model):
    MODALIDAD_CHOICES = [
        ('Presencial', 'Presencial'),
        ('Remoto', 'Remoto'),
        ('Híbrido', 'Híbrido'),
        ('Freelance', 'Freelance'),
    ]
    CONTRATO_CHOICES = [
        ('Término indefinido', 'Término indefinido'),
        ('Término fijo', 'Término fijo'),
        ('Prestación de servicios', 'Prestación de servicios'),
        ('Obra o labor', 'Obra o labor'),
        ('Independiente', 'Independiente'),
    ]
    SALARIO_CHOICES = [
        ('Menos de 2 SMMLV', 'Menos de 2 SMMLV'),
        ('Entre 2 y 4 SMMLV', 'Entre 2 y 4 SMMLV'),
        ('Entre 4 y 6 SMMLV', 'Entre 4 y 6 SMMLV'),
        ('Entre 6 y 8 SMMLV', 'Entre 6 y 8 SMMLV'),
        ('Entre 8 y 10 SMMLV', 'Entre 8 y 10 SMMLV'),
        ('Más de 10 SMMLV', 'Más de 10 SMMLV'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    perfil = models.ForeignKey(PerfilEgresado, on_delete=models.CASCADE, related_name='experiencias')
    empresa = models.CharField(max_length=150)
    nit = models.CharField(max_length=20, blank=True)
    sector_economico = models.CharField(max_length=100, blank=True)
    cargo = models.CharField(max_length=100)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    cargo_actual = models.BooleanField(default=False)
    modalidad = models.CharField(max_length=20, choices=MODALIDAD_CHOICES)
    tipo_contrato = models.CharField(max_length=30, choices=CONTRATO_CHOICES)
    rango_salarial = models.CharField(max_length=30, choices=SALARIO_CHOICES)

    def __str__(self):
        return f"{self.cargo} en {self.empresa}"

class EstudioPosterior(models.Model):
    NIVEL_CHOICES = [
        ('Especialización', 'Especialización'),
        ('Maestría', 'Maestría'),
        ('Doctorado', 'Doctorado'),
        ('Certificación', 'Certificación'),
    ]
    ESTADO_CHOICES = [
        ('En curso', 'En curso'),
        ('Finalizado', 'Finalizado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    perfil = models.ForeignKey(PerfilEgresado, on_delete=models.CASCADE, related_name='estudios')
    nivel_estudio = models.CharField(max_length=30, choices=NIVEL_CHOICES)
    institucion = models.CharField(max_length=150)
    titulo = models.CharField(max_length=150)
    pais = models.CharField(max_length=100, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Finalizado')
    fecha_graduacion = models.DateField(null=True, blank=True)
    anio_finalizacion = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.nivel_estudio}: {self.titulo}"

class RedProfesional(models.Model):
    PLATAFORMA_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('github', 'GitHub'),
        ('gitlab', 'GitLab'),
        ('portafolio', 'Portafolio Personal'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    perfil = models.ForeignKey(PerfilEgresado, on_delete=models.CASCADE, related_name='redes')
    plataforma = models.CharField(max_length=20, choices=PLATAFORMA_CHOICES)
    url = models.URLField()
    visibilidad = models.CharField(max_length=15, default='publico')

    def __str__(self):
        return f"{self.plataforma}: {self.url}"

class DocumentoAdjunto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    perfil = models.ForeignKey(PerfilEgresado, on_delete=models.CASCADE, related_name='documentos')
    nombre = models.CharField(max_length=255)
    archivo = models.FileField(upload_to='egresados/documentos/')
    tipo_documento = models.CharField(max_length=100) # MIME-type
    tamano = models.CharField(max_length=20, blank=True)
    fecha_carga = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.nombre