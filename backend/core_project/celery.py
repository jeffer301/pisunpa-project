import os
from celery import Celery

# 1. Fijar las variables de entorno de Django para el comando de Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_project.settings')

# 2. Instanciar la aplicación (Este objeto DEBE ser accesible como core_project.celery)
app = Celery('core_project')

# 3. Cargar la configuración de Django usando el namespace 'CELERY'
app.config_from_object('django.conf:settings', namespace='CELERY')

# 4. Descubrir automáticamente las tareas distribuidas en los archivos tasks.py de tus apps
app.autodiscover_tasks()