from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist
from .models import PerfilEgresado
from .tasks import procesar_importacion_masiva_egresados

class EgresadoService:

    @staticmethod
    def obtener_perfil_completo(user):
        try:
            return PerfilEgresado.objects.prefetch_related(
                'experiencias', 'estudios', 'redes', 'documentos'
            ).get(usuario=user)
        except PerfilEgresado.DoesNotExist:
            raise ObjectDoesNotExist("El usuario no cuenta con un perfil de egresado registrado.")

    @staticmethod
    @transaction.atomic
    def actualizar_perfil(user, data):
        """
        Actualiza de forma atómica el perfil principal del egresado.
        """
        perfil, created = PerfilEgresado.objects.get_or_create(
            usuario=user,
            defaults={"numero_documento": user.username}
        )

        # Actualización de campos escalares permitidos
        perfil.tipo_documento = data.get('tipo_documento', perfil.tipo_documento)
        perfil.numero_documento = data.get('numero_documento', perfil.numero_documento)
        perfil.fecha_nacimiento = data.get('fecha_nacimiento', perfil.fecha_nacimiento)
        perfil.telefono_celular = data.get('telefono_celular', perfil.telefono_celular)
        perfil.direccion_residencia = data.get('direccion_residencia', perfil.direccion_residencia)
        perfil.biografia = data.get('biografia', perfil.biografia)
        perfil.trabaja_actualmente = data.get('trabaja_actualmente', perfil.trabaja_actualmente)
        
        if 'programa_id' in data:
            perfil.programa_id = data['programa_id']
        if 'departamento_id' in data:
            perfil.departamento_id = data['departamento_id']
        if 'ciudad_id' in data:
            perfil.ciudad_id = data['ciudad_id']

        # Datos de emergencia
        perfil.contacto_emergencia_nombre = data.get('contacto_emergencia_nombre', perfil.contacto_emergencia_nombre)
        perfil.contacto_emergencia_parentesco = data.get('contacto_emergencia_parentesco', perfil.contacto_emergencia_parentesco)
        perfil.contacto_emergencia_telefono = data.get('contacto_emergencia_telefono', perfil.contacto_emergencia_telefono)
        perfil.contacto_emergencia_email = data.get('contacto_emergencia_email', perfil.contacto_emergencia_email)

        perfil.save()
        return perfil

    @staticmethod
    def lanzar_importacion_masiva(archivo_id_o_ruta):
        # Despacho asíncrono seguro delegando a Celery
        task = procesar_importacion_masiva_egresados.delay(archivo_id_o_ruta)
        return task.id