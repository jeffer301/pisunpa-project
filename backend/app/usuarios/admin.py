from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario, Rol


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "descripcion")
    search_fields = ("nombre",)


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
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