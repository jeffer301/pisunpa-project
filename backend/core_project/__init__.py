from .celery import app as celery

# Esto asegura que la app de Celery se cargue siempre que Django inicie
__all__ = ('celery',)