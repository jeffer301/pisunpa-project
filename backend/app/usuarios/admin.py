from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import Usuario, Rol

# 1. Definimos un formulario de creación que exija tus campos obligatorios
class UsuarioCreationForm(UserCreationForm):
    class Meta:
        model = Usuario
        # Incluimos los campos requeridos para que Django no intente insertarlos en blanco
        fields = ("email", "username", "documento")

# 2. Definimos el formulario de cambio para mantener coherencia
class UsuarioChangeForm(UserChangeForm):
    class Meta:
        model = Usuario
        fields = "__all__"

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "descripcion")
    search_fields = ("nombre",)

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    # Inyectamos los formularios personalizados
    add_form = UsuarioCreationForm
    form = UsuarioChangeForm

    list_display = (
        "id",
        "email",
        "username",
        "first_name",
        "last_name",
        "rol",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "email",
        "username",
        "documento",
    )

    ordering = ("email",)

    # fieldsets maneja la vista de EDICIÓN
    fieldsets = UserAdmin.fieldsets + (
        (
            "Información adicional",
            {
                "fields": (
                    "documento",
                    "telefono",
                    "foto",
                    "rol",
                )
            },
        ),
    )

    # add_fieldsets maneja la vista de CREACIÓN
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Campos Obligatorios Personalizados",
            {
                "fields": (
                    "email",
                    "documento",
                )
            },
        ),
    )