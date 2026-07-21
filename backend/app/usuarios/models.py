import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

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
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    
    def __str__(self):
        return self.email