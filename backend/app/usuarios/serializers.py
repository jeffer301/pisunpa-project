from django.contrib.auth import get_user_model
from rest_framework import serializers
from .services import UsuarioService

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
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
        # Removemos la confirmación de contraseña requerida solo a nivel del serializador
        validated_data.pop("password2")
        
        # Delegamos la persistencia e instanciación a la capa de servicios
        return UsuarioService.registrar_usuario(validated_data)