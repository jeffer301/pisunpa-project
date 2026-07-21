from django.db import models


class Departamento(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


class Ciudad(models.Model):
    nombre = models.CharField(max_length=100)
    departamento = models.ForeignKey(Departamento, related_name='ciudades', on_delete=models.CASCADE)

    def __str__(self):
        return self.nombre


class Programa(models.Model):
    nombre = models.CharField(max_length=150)

    def __str__(self):
        return self.nombre
