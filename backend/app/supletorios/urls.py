from django.urls import path
from .views import (
    SolicitudSupletorioCreateView,
    MisSolicitudesView,
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
    path('mis-solicitudes/', MisSolicitudesView.as_view()),
    path('pago/comprobante/', SubirComprobanteView.as_view()),
    path('bandeja/', BandejaSupletoriosListView.as_view()),
    path('bandeja/<int:pk>/aprobar/', AprobarSupletorioView.as_view()),
    path('bandeja/<int:pk>/rechazar/', RechazarSupletorioView.as_view()),
    path('bandeja/<int:pk>/confirmar-pago/', ConfirmarPagoView.as_view()),
    path('pendientes/', SupletoriosPendientesListView.as_view()),
    path('pendientes/<int:pk>/realizado/', MarcarRealizadoView.as_view()),
]