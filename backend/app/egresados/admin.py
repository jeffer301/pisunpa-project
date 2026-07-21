from django.contrib import admin
from .models import (
    Departamento, Ciudad, Programa, PerfilEgresado, 
    ExperienciaLaboral, EstudioPosterior, RedProfesional, DocumentoAdjunto
)

class ExperienciaLaboralInline(admin.TabularInline):
    model = ExperienciaLaboral
    extra = 1
    fields = ('empresa', 'cargo', 'fecha_inicio', 'fecha_fin', 'cargo_actual', 'modalidad', 'rango_salarial')

class EstudioPosteriorInline(admin.TabularInline):
    model = EstudioPosterior
    extra = 1
    fields = ('nivel_estudio', 'institucion', 'titulo', 'estado', 'anio_finalizacion')

class RedProfesionalInline(admin.TabularInline):
    model = RedProfesional
    extra = 1

class DocumentoAdjuntoInline(admin.TabularInline):
    model = DocumentoAdjunto
    extra = 1
    readonly_fields = ('fecha_carga',)

@admin.register(PerfilEgresado)
class PerfilEgresadoAdmin(admin.ModelAdmin):
    list_display = ('get_fullname', 'numero_documento', 'programa', 'trabaja_actualmente', 'ciudad')
    search_fields = ('usuario__first_name', 'usuario__last_name', 'numero_documento')
    list_filter = ('programa', 'trabaja_actualmente', 'tipo_documento')
    inlines = [
        ExperienciaLaboralInline, 
        EstudioPosteriorInline, 
        RedProfesionalInline, 
        DocumentoAdjuntoInline
    ]

    def get_fullname(self, obj):
        return obj.usuario.get_full_name()
    get_fullname.short_description = 'Egresado'

@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

@admin.register(Departamento)
class DepartamentoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

@admin.register(Ciudad)
class CiudadAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'departamento')
    list_filter = ('departamento',)
    search_fields = ('nombre',)