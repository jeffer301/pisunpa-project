from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramaListView, AsignaturaListView,
    DepartamentoListView, CiudadListView, PerfilEgresadoViewSet,
    ProfesorAsignaturaViewSet, ProfesoresPorAsignaturaView,
    GruposPorAsignaturaView, EventoViewSet,
)

router = DefaultRouter()
router.register(r'perfilegresado', PerfilEgresadoViewSet, basename='perfil-egresado')
router.register(r'profesor-asignaturas', ProfesorAsignaturaViewSet, basename='profesor-asignatura')
router.register(r'eventos', EventoViewSet, basename='evento')

urlpatterns = [
    # Mantenemos las rutas públicas de consulta de catálogos solicitadas
    path('programas/', ProgramaListView.as_view(), name='programas-list'),
    path('asignaturas/', AsignaturaListView.as_view(), name='asignaturas-list'),
    path('profesores-por-asignatura/', ProfesoresPorAsignaturaView.as_view(), name='profesores-por-asignatura'),
    path('grupos-por-asignatura/', GruposPorAsignaturaView.as_view(), name='grupos-por-asignatura'),
    path('departamentos/', DepartamentoListView.as_view(), name='departamentos-list'),
    path('ciudades/', CiudadListView.as_view(), name='ciudades-list'),

    # Rutas dinámicas del CRUD y operaciones masivas
    path('', include(router.urls)),
    # Compatibilidad con frontend: /create/ y /{id}/delete/
    path('profesor-asignaturas/create/',
         ProfesorAsignaturaViewSet.as_view({'post': 'create'}),
         name='profesor-asignatura-create'),
    path('profesor-asignaturas/<uuid:pk>/delete/',
         ProfesorAsignaturaViewSet.as_view({'delete': 'destroy'}),
         name='profesor-asignatura-delete'),
]