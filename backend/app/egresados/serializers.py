from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Departamento, Ciudad, Programa, PerfilEgresado,
    ExperienciaLaboral, EstudioPosterior, RedProfesional, DocumentoAdjunto
)

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']

class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nombre']

class CiudadSerializer(serializers.ModelSerializer):
    idDepartamento = serializers.UUIDField(source='departamento_id')

    class Meta:
        model = Ciudad
        fields = ['id', 'nombre', 'idDepartamento']

class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = ['id', 'nombre']

# --- Satélites ---

class ExperienciaLaboralSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = ExperienciaLaboral
        fields = '__all__'
        extra_kwargs = {'perfil': {'write_only': True}}

class EstudioPosteriorSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = EstudioPosterior
        fields = '__all__'
        extra_kwargs = {'perfil': {'write_only': True}}

class RedProfesionalSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = RedProfesional
        fields = '__all__'
        extra_kwargs = {'perfil': {'write_only': True}}

class DocumentoAdjuntoSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = DocumentoAdjunto
        fields = '__all__'
        extra_kwargs = {'perfil': {'write_only': True}}

# --- Agregado Raíz ---

class PerfilEgresadoReadSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    usuario = UserSimpleSerializer(read_only=True)
    programa = ProgramaSerializer(read_only=True)
    departamento = DepartamentoSerializer(read_only=True)
    ciudad = CiudadSerializer(read_only=True)
    
    experiencias = ExperienciaLaboralSerializer(many=True, read_only=True)
    estudios = EstudioPosteriorSerializer(many=True, read_only=True)
    redes = RedProfesionalSerializer(many=True, read_only=True)
    documentos = DocumentoAdjuntoSerializer(many=True, read_only=True)

    class Meta:
        model = PerfilEgresado
        fields = '__all__'

class PerfilEgresadoWriteSerializer(serializers.ModelSerializer):
    programa_id = serializers.UUIDField(write_only=True, required=False)
    departamento_id = serializers.UUIDField(write_only=True, required=False)
    ciudad_id = serializers.UUIDField(write_only=True, required=False)
    usuario_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = PerfilEgresado
        fields = [
            'tipo_documento', 'numero_documento', 'fecha_nacimiento',
            'telefono_celular', 'direccion_residencia', 'biografia',
            'trabaja_actualmente', 'programa_id', 'departamento_id', 'ciudad_id',
            'contacto_emergencia_nombre', 'contacto_emergencia_parentesco',
            'contacto_emergencia_telefono', 'contacto_emergencia_email',
            'validado', 'usuario_id',
        ]