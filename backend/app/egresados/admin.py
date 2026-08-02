from django.contrib import admin
from .models import Departamento, Ciudad, Programa, Evento, InscripcionEvento


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


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ['id', 'nombre', 'fecha', 'hora', 'lugar', 'capacidad']
    list_filter = ['fecha']


@admin.register(InscripcionEvento)
class InscripcionEventoAdmin(admin.ModelAdmin):
    list_display = ['id', 'evento', 'nombre_egresado', 'documento_egresado', 'cancelada']