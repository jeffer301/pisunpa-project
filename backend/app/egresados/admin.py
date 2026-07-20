from django.contrib import admin
from .models import Departamento, Ciudad, Programa


@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre']


@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre']


@admin.register(Ciudad)
class CiudadAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'departamento']
    list_filter = ['departamento']