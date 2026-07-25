from django.contrib import admin
from .models import Supletorio, AnexoSupletorio


class AnexoSupletorioInline(admin.TabularInline):
    model = AnexoSupletorio
    extra = 0


@admin.register(Supletorio)
class SupletorioAdmin(admin.ModelAdmin):
    list_display = ['id', 'estudiante_nombre', 'asignatura', 'profesor', 'estado', 'fecha_parcial', 'fecha_solicitud']
    list_filter = ['estado', 'programa']
    search_fields = ['estudiante_nombre', 'estudiante_email', 'asignatura', 'profesor']
    inlines = [AnexoSupletorioInline]
