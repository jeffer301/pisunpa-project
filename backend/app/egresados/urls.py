from django.urls import path
from .views import ProgramaListView, DepartamentoListView, CiudadListView

urlpatterns = [
    path('programas/', ProgramaListView.as_view()),
    path('departamentos/', DepartamentoListView.as_view()),
    path('ciudades/', CiudadListView.as_view()),
]