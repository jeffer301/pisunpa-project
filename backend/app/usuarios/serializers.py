from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import InvitacionDocente, Notificacion, Rol
from .permissions import es_superadmin, puede_asignar_rol, puede_tocar_usuario
from .services import UsuarioService

Usuario = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "documento",
            "telefono",
            "foto",
            "rol"
        )
        read_only_fields = ("id",)

    def get_rol(self, obj):
        if obj.rol:
            return obj.rol.nombre
        return None


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "documento",
            "telefono",
            "foto",
            "rol",
            "password",
            "password2",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        return attrs

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este correo."
            )
        return value

    def validate_documento(self, value):
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este documento."
            )
        return value

    def create(self, validated_data):
        validated_data.pop("password2")
        return UsuarioService.registrar_usuario(validated_data)


class RegistroConRolSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, min_length=8
    )
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento = serializers.CharField(max_length=20)
    documento_identidad = serializers.CharField(
        max_length=20, required=False, default=''
    )
    telefono = serializers.CharField(
        max_length=20, required=False, default=''
    )
    tipo_usuario = serializers.ChoiceField(
        choices=['egresado', 'estudiante']
    )
    programa_id = serializers.UUIDField(required=False)
    direccion_residencia = serializers.CharField(
        max_length=255, required=False, default='', allow_blank=True
    )
    biografia = serializers.CharField(
        required=False, default='', allow_blank=True
    )

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este correo."
            )
        return value

    def validate_documento(self, value):
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError(
                "Ya existe un usuario con este documento."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden"}
            )
        if attrs["tipo_usuario"] == "egresado":
            if not attrs.get("programa_id"):
                raise serializers.ValidationError(
                    {"programa_id": "El programa es requerido para egresados."}
                )
        return attrs


class UsuariosDisponiblesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'first_name',
            'last_name', 'documento', 'telefono',
        ]


class RegistroDocenteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento_identidad = serializers.CharField(max_length=20)

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este correo.")
        return value

    def validate_documento_identidad(self, value):
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este documento.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs


class EstudiantePendienteSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'first_name', 'last_name', 'documento', 'documento_identidad', 'estado', 'creado', 'rol']

    def get_rol(self, obj):
        if obj.rol:
            return obj.rol.nombre
        return None


class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.estado == 'pendiente_aprobacion':
            raise PermissionDenied(
                "Tu cuenta está pendiente de aprobación por el director/administrador."
            )
        if user.estado == 'rechazado':
            raise PermissionDenied(
                "Tu cuenta ha sido rechazada."
            )
        return data


class NotificacionSerializer(serializers.ModelSerializer):
    supletorio_id = serializers.UUIDField(source='supletorio.id', read_only=True, default=None)
    evento_id = serializers.UUIDField(source='evento.id', read_only=True, default=None)

    class Meta:
        model = Notificacion
        fields = ['id', 'titulo', 'mensaje', 'tipo', 'leido', 'supletorio_id', 'evento_id', 'creado_en']
        read_only_fields = ['id', 'titulo', 'mensaje', 'tipo', 'leido', 'supletorio_id', 'evento_id', 'creado_en']


class ProfesorSerializer(serializers.ModelSerializer):
    invitacion_enviada = serializers.SerializerMethodField()
    invitacion_usada = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = [
            'id', 'first_name', 'last_name', 'email', 'documento',
            'documento_identidad', 'telefono', 'estado', 'creado',
            'invitacion_enviada', 'invitacion_usada',
        ]

    def get_invitacion_enviada(self, obj):
        return obj.invitaciones.exists()

    def get_invitacion_usada(self, obj):
        return obj.invitaciones.filter(usado=True).exists()


class InvitacionDocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvitacionDocente
        fields = ['id', 'email', 'token', 'usado', 'valido', 'creado_en', 'expiracion']
        read_only_fields = ['id', 'token', 'valido', 'creado_en', 'expiracion']


class InvitacionDetailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    token = serializers.UUIDField()
    valido = serializers.BooleanField()


class RegistroDocenteConTokenSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    documento_identidad = serializers.CharField(max_length=20)

    def validate_token(self, value):
        try:
            invitacion = InvitacionDocente.objects.get(token=value)
        except InvitacionDocente.DoesNotExist:
            raise serializers.ValidationError('El enlace de invitación no es válido.')
        if not invitacion.valido:
            raise serializers.ValidationError('La invitación ha expirado o ya fue utilizada.')
        return value

    def validate_documento_identidad(self, value):
        Usuario = get_user_model()
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este documento.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        return attrs


class UsuarioGestionSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'nombre', 'email',
                  'documento', 'telefono', 'estado', 'creado', 'rol']

    def get_rol(self, obj):
        return obj.rol.nombre if obj.rol else None

    def get_nombre(self, obj):
        return obj.get_full_name() or obj.email


class CambioRolSerializer(serializers.Serializer):
    rol = serializers.CharField(max_length=50)

    def validate_rol(self, value):
        try:
            self._rol = Rol.objects.get(nombre=value)
        except Rol.DoesNotExist:
            raise serializers.ValidationError('El rol indicado no existe.')
        return value

    def validate(self, attrs):
        usuario = self.context['usuario']
        solicitante = self.context['solicitante']
        if usuario.pk == solicitante.pk:
            raise serializers.ValidationError('No puedes cambiar tu propio rol.')
        if not puede_tocar_usuario(solicitante, usuario):
            raise serializers.ValidationError(
                'Solo el director puede modificar cuentas de administrador o director.'
            )
        if not puede_asignar_rol(solicitante, self._rol.nombre):
            raise serializers.ValidationError('No tienes permiso para asignar este rol.')
        return attrs

    def save(self):
        usuario = self.context['usuario']
        usuario.rol = self._rol
        usuario.save(update_fields=['rol'])
        return usuario


class CrearAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, default='')
    documento = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    rol = serializers.CharField(max_length=50, default='administrador')

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este correo.')
        return value

    def validate_documento(self, value):
        if Usuario.objects.filter(documento=value).exists():
            raise serializers.ValidationError('Ya existe un usuario con este documento.')
        return value

    def validate_rol(self, value):
        if value not in ('administrador', 'coordinador', 'secretario'):
            raise serializers.ValidationError(
                'El rol debe ser administrador, coordinador o secretario.'
            )
        return value

    def create(self, validated_data):
        rol = Rol.objects.get(nombre=validated_data['rol'])
        usuario = Usuario(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            documento=validated_data['documento'],
            rol=rol,
            estado='aprobado',
        )
        usuario.set_password(validated_data['password'])
        usuario.save()
        return usuario
