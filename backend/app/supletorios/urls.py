from django.urls import path
from .views import (
    SolicitudSupletorioCreateView,
    SubirComprobanteView,
    BandejaSupletoriosListView,
    AprobarSupletorioView,
    RechazarSupletorioView,
    ConfirmarPagoView,
    SupletoriosPendientesListView,
    MarcarRealizadoView,
)

urlpatterns = [
    path('solicitudes/', SolicitudSupletorioCreateView.as_view()),
    path('pago/comprobante/', SubirComprobanteView.as_view()),
    path('bandeja/', BandejaSupletoriosListView.as_view()),
    path('bandeja/<uuid:pk>/aprobar/', AprobarSupletorioView.as_view()),
    path('bandeja/<uuid:pk>/rechazar/', RechazarSupletorioView.as_view()),
    path('bandeja/<uuid:pk>/confirmar-pago/', ConfirmarPagoView.as_view()),
    path('pendientes/', SupletoriosPendientesListView.as_view()),
    path('pendientes/<uuid:pk>/realizado/', MarcarRealizadoView.as_view()),
]