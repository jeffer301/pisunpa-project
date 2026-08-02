from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Departamento, Ciudad, Programa, Asignatura, PerfilEgresado,
    ExperienciaLaboral, EstudioPosterior, RedProfesional, DocumentoAdjunto,
    ProfesorAsignatura, Grupo, Evento, InscripcionEvento,
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


class AsignaturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignatura
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


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'codigo']


class ProfesorAsignaturaSerializer(serializers.ModelSerializer):
    profesor_email = serializers.CharField(source='profesor.email', read_only=True)
    profesor_nombre = serializers.SerializerMethodField()
    asignatura_nombre = serializers.CharField(source='asignatura.nombre', read_only=True)

    class Meta:
        model = ProfesorAsignatura
        fields = ['id', 'profesor', 'profesor_email', 'profesor_nombre',
                  'asignatura', 'asignatura_nombre']

    def get_profesor_nombre(self, obj):
        return f"{obj.profesor.first_name} {obj.profesor.last_name}".strip()


class ProfesorAsignaturaWriteSerializer(serializers.Serializer):
    profesor_id = serializers.UUIDField()
    asignatura_id = serializers.UUIDField()

    def validate_profesor_id(self, value):
        User = get_user_model()
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Profesor no encontrado.")
        if not user.rol or user.rol.nombre != 'profesor':
            raise serializers.ValidationError("El usuario no tiene rol de profesor.")
        return value

    def validate_asignatura_id(self, value):
        try:
            Asignatura.objects.get(id=value)
        except Asignatura.DoesNotExist:
            raise serializers.ValidationError("Asignatura no encontrada.")
        return value

    def validate(self, attrs):
        if ProfesorAsignatura.objects.filter(
            profesor_id=attrs['profesor_id'],
            asignatura_id=attrs['asignatura_id']
        ).exists():
            raise serializers.ValidationError("Esta asignación ya existe.")
        return attrs


class EventoSerializer(serializers.ModelSerializer):
    inscrito = serializers.SerializerMethodField()
    cupos_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'descripcion', 'fecha', 'hora', 'lugar',
                  'capacidad', 'inscrito', 'cupos_disponibles', 'creado_en']

    def get_inscrito(self, obj):
        user = self.context['request'].user
        return obj.inscripciones.filter(
            egresado=user, cancelada=False
        ).exists()

    def get_cupos_disponibles(self, obj):
        if obj.capacidad is None:
            return None
        ocupados = obj.inscripciones.filter(cancelada=False).count()
        return obj.capacidad - ocupados


class EventoWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = ['id', 'nombre', 'descripcion', 'fecha', 'hora', 'lugar', 'capacidad']
        read_only_fields = ['id']


class InscripcionEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscripcionEvento
        fields = ['id', 'evento', 'egresado', 'nombre_egresado',
                  'documento_egresado', 'programa_egresado', 'fecha_inscripcion']
        read_only_fields = fields