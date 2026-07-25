from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
        if Usuario.objects.filter(documento_identidad=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este documento.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs


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
