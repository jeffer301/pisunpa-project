from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramaListView, DepartamentoListView, CiudadListView, PerfilEgresadoViewSet
)

router = DefaultRouter()
router.register(r'perfilegresado', PerfilEgresadoViewSet, basename='perfil-egresado')

urlpatterns = [
    # Mantenemos las rutas públicas de consulta de catálogos solicitadas
    path('programas/', ProgramaListView.as_view(), name='programas-list'),
    path('departamentos/', DepartamentoListView.as_view(), name='departamentos-list'),
    path('ciudades/', CiudadListView.as_view(), name='ciudades-list'),
    
    # Rutas dinámicas del CRUD y operaciones masivas
    path('', include(router.urls)),
]