from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from app.usuarios.permissions import (
    IsAuthenticated,
    EsAdminLectura,
    EsAdminEscritura,
    ADMIN_LECTURA,
)
from app.usuarios.notification_service import NotificacionService

from .models import Supletorio, EstadoSupletorio
from .serializers import (
    SupletorioCreateSerializer,
    SupletorioBandejaSerializer,
    SupletorioPendienteSerializer,
    MiSolicitudSupletorioSerializer,
)
from .utils import enviar_correo


# --- Estudiante: crear solicitud ---
class SolicitudSupletorioCreateView(generics.CreateAPIView):
    serializer_class = SupletorioCreateSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        supletorio = serializer.save()
        NotificacionService.crear(
            usuario=request.user,
            titulo='Solicitud de supletorio creada',
            mensaje=(
                f'Solicitud de {supletorio.asignatura} registrada '
                f'({supletorio.estudiante_nombre}).'
            ),
            tipo='solicitud_creada',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# --- Estudiante: mis solicitudes (bandeja "Mis Supletorios") ---
class MisSolicitudesView(generics.ListAPIView):
    serializer_class = MiSolicitudSupletorioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Supletorio.objects.filter(
            estudiante_email=self.request.user.email
        ).order_by('-creado_en')


# --- Estudiante: subir comprobante de pago ---
class SubirComprobanteView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        archivo = request.FILES.get('comprobante')
        if not archivo:
            return Response({'detail': 'No se envió ningún archivo.'}, status=400)

        supletorio = Supletorio.objects.filter(
            estudiante_email=request.user.email,
            estado=EstadoSupletorio.FORMATO_PENDIENTE,
        ).order_by('-creado_en').first()

        if not supletorio:
            return Response({'detail': 'No tienes una solicitud aprobada pendiente de pago.'}, status=404)

        supletorio.comprobante_pago = archivo
        supletorio.estado = EstadoSupletorio.COMPROBANTE_SUBIDO
        supletorio.save()

        NotificacionService.crear(
            usuario=request.user,
            titulo='Comprobante de pago recibido',
            mensaje=f'Comprobante de pago para {supletorio.asignatura} recibido.',
            tipo='pago_confirmado',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )

        return Response({'detail': 'Comprobante recibido correctamente.'}, status=200)


# --- Admin: bandeja ---
class BandejaSupletoriosListView(generics.ListAPIView):
    serializer_class = SupletorioBandejaSerializer
    queryset = Supletorio.objects.all().order_by('-creado_en')
    permission_classes = [IsAuthenticated, EsAdminLectura]


class AprobarSupletorioView(APIView):
    permission_classes = [IsAuthenticated, EsAdminEscritura]

    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.FORMATO_PENDIENTE
        supletorio.save()
        enviar_correo(
            supletorio.estudiante_email,
            'Solicitud de supletorio aprobada',
            'Tu solicitud fue aprobada. Ya puedes llenar el formato y realizar el pago.',
        )
        NotificacionService.crear(
            usuario=request.user,
            titulo='Solicitud de supletorio aprobada',
            mensaje=(
                f'La solicitud de {supletorio.estudiante_nombre} '
                f'({supletorio.asignatura}) fue aprobada.'
            ),
            tipo='solicitud_aprobada',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )
        return Response(SupletorioBandejaSerializer(supletorio).data)


class RechazarSupletorioView(APIView):
    permission_classes = [IsAuthenticated, EsAdminEscritura]

    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.RECHAZADA
        supletorio.save()
        NotificacionService.crear(
            usuario=request.user,
            titulo='Solicitud de supletorio rechazada',
            mensaje=(
                f'La solicitud de {supletorio.estudiante_nombre} '
                f'({supletorio.asignatura}) fue rechazada.'
            ),
            tipo='solicitud_rechazada',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )
        return Response(SupletorioBandejaSerializer(supletorio).data)


class ConfirmarPagoView(APIView):
    permission_classes = [IsAuthenticated, EsAdminEscritura]

    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.NOTIFICADO_PROFESOR
        supletorio.save()
        NotificacionService.crear(
            usuario=request.user,
            titulo='Pago confirmado',
            mensaje=f'Pago de {supletorio.estudiante_nombre} ({supletorio.asignatura}) confirmado.',
            tipo='pago_confirmado',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )
        # El profesor aún no tiene email real (campo `profesor` es texto libre).
        # Cuando exista FK a Usuario, reemplazar destinatario por supletorio.profesor.email
        return Response(SupletorioBandejaSerializer(supletorio).data)


# --- Profesor: pendientes ---
class SupletoriosPendientesListView(generics.ListAPIView):
    serializer_class = SupletorioPendienteSerializer
    queryset = Supletorio.objects.filter(
        estado__in=[EstadoSupletorio.NOTIFICADO_PROFESOR, EstadoSupletorio.REALIZADO]
    ).order_by('-actualizado_en')


class MarcarRealizadoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.REALIZADO
        supletorio.save()
        enviar_correo(
            getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', ''),
            'Supletorio realizado',
            f'El supletorio de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue marcado como realizado.',
        )
        NotificacionService.crear(
            usuario=request.user,
            titulo='Supletorio realizado',
            mensaje=f'El supletorio de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue calificado.',
            tipo='examen_calificado',
            supletorio=supletorio,
            roles_broadcast=list(ADMIN_LECTURA),
        )
        return Response(SupletorioPendienteSerializer(supletorio).data)