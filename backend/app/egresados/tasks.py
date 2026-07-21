import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from .models import PerfilEgresado, Programa

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task
def procesar_importacion_masiva_egresados(archivo_id_o_ruta):
    """
    Simulación robusta de la lectura y procesamiento en segundo plano 
    de archivos estructurados de egresados para su ingesta directa.
    """
    logger.info(f"Iniciando procesamiento masivo de egresados: {archivo_id_o_ruta}")
    
    # Simulación lógica: En producción se leería de un almacenamiento remoto (S3, etc.)
    registros_procesados = 0
    registros_fallidos = 0
    
    # Simulación de registros extraídos del archivo
    registros_ejemplo = [
        {
            "username": "1111222333",
            "email": "carlos.arturo@upacifico.edu.co",
            "first_name": "Carlos Arturo",
            "last_name": "Mosquera Riascos",
            "tipo_documento": "CC",
            "numero_documento": "1111222333",
            "programa_id": None # Se enlazará de manera dinámica
        }
    ]

    for data in registros_ejemplo:
        try:
            # Obtención o creación segura de usuarios del sistema
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={
                    "email": data["email"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                }
            )
            
            # Obtener el primer programa del sistema por defecto como fallback
            programa = Programa.objects.first()
            
            PerfilEgresado.objects.update_or_create(
                usuario=user,
                defaults={
                    "tipo_documento": data["tipo_documento"],
                    "numero_documento": data["numero_documento"],
                    "programa": programa,
                    "trabaja_actualmente": False
                }
            )
            registros_procesados += 1
        except Exception as e:
            logger.error(f"Error importando registro {data.get('username')}: {str(e)}")
            registros_fallidos += 1

    logger.info(f"Procesamiento masivo finalizado. Exitosos: {registros_procesados}, Fallidos: {registros_fallidos}")
    return {"exitosos": registros_procesados, "fallidos": registros_fallidos}