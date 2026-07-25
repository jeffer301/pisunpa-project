from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Supletorio, EstadoSupletorio
from .serializers import (
    SupletorioCreateSerializer,
    SupletorioBandejaSerializer,
    SupletorioPendienteSerializer,
    SupletorioMiSolicitudSerializer,
    AgendarExamenSerializer,
    CalificarExamenSerializer,
)
from .utils import enviar_correo
from app.usuarios.notification_service import NotificacionService
from app.usuarios.models import Usuario


# --- Estudiante: crear solicitud ---
class SolicitudSupletorioCreateView(generics.CreateAPIView):
    serializer_class = SupletorioCreateSerializer
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        supletorio = serializer.save()
        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Nueva solicitud de supletorio',
                mensaje=f'{supletorio.estudiante_nombre} solicitó un supletorio de {supletorio.asignatura}.',
                tipo='solicitud_creada',
                supletorio=supletorio,
            )


# --- Estudiante: subir comprobante de pago ---
class SubirComprobanteView(APIView):
    parser_classes = [MultiPartParser]

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

        return Response({'detail': 'Comprobante recibido correctamente.'}, status=200)


# --- Admin: bandeja ---
class BandejaSupletoriosListView(generics.ListAPIView):
    serializer_class = SupletorioBandejaSerializer
    queryset = Supletorio.objects.all().order_by('-creado_en')


class AprobarSupletorioView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.FORMATO_PENDIENTE
        supletorio.save()

        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Solicitud aprobada',
            mensaje=f'Tu solicitud de supletorio de {supletorio.asignatura} fue aprobada. Ya puedes llenar el formato y realizar el pago.',
            tipo='solicitud_aprobada',
            supletorio=supletorio,
        )

        enviar_correo(
            supletorio.estudiante_email,
            'Solicitud de supletorio aprobada',
            'Tu solicitud fue aprobada. Ya puedes llenar el formato y realizar el pago.',
        )
        return Response(SupletorioBandejaSerializer(supletorio).data)


class RechazarSupletorioView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.RECHAZADA
        supletorio.save()

        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Solicitud rechazada',
            mensaje=f'Tu solicitud de supletorio de {supletorio.asignatura} fue rechazada.',
            tipo='solicitud_rechazada',
            supletorio=supletorio,
        )

        return Response(SupletorioBandejaSerializer(supletorio).data)


class ConfirmarPagoView(APIView):
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.NOTIFICADO_PROFESOR
        supletorio.save()

        NotificacionService.crear(
            usuario=supletorio.usuario,
            titulo='Pago confirmado',
            mensaje=f'El pago de tu supletorio de {supletorio.asignatura} fue confirmado. El profesor será notificado.',
            tipo='pago_confirmado',
            supletorio=supletorio,
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
    def post(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        supletorio.estado = EstadoSupletorio.REALIZADO
        supletorio.save()
        enviar_correo(
            getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', ''),
            'Supletorio realizado',
            f'El supletorio de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue marcado como realizado.',
        )
        return Response(SupletorioPendienteSerializer(supletorio).data)


# --- Estudiante: ver sus propias solicitudes ---
class MisSolicitudesView(generics.ListAPIView):
    serializer_class = SupletorioMiSolicitudSerializer

    def get_queryset(self):
        return Supletorio.objects.filter(
            usuario=self.request.user
        ).order_by('-creado_en')


class AgendarExamenView(APIView):
    def patch(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        serializer = AgendarExamenSerializer(
            data=request.data,
            context={'supletorio': supletorio}
        )
        serializer.is_valid(raise_exception=True)

        supletorio.fecha_examen_supletorio = serializer.validated_data['fecha_examen_supletorio']
        supletorio.fecha_programacion = timezone.now()
        supletorio.programado_por = request.user
        supletorio.estado = EstadoSupletorio.AGENDADO
        supletorio.save()

        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Examen supletorio agendado',
                mensaje=f'El examen de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue agendado para el {supletorio.fecha_examen_supletorio}.',
                tipo='examen_agendado',
                supletorio=supletorio,
            )

        estudiante = supletorio.usuario
        NotificacionService.crear(
            usuario=estudiante,
            titulo='Tu examen supletorio fue agendado',
            mensaje=f'Tu examen de {supletorio.asignatura} fue programado para el {supletorio.fecha_examen_supletorio}.',
            tipo='examen_agendado',
            supletorio=supletorio,
        )

        return Response({'detail': 'Examen agendado correctamente'})


class CalificarExamenView(APIView):
    def patch(self, request, pk):
        supletorio = get_object_or_404(Supletorio, pk=pk)
        serializer = CalificarExamenSerializer(
            data=request.data,
            context={'supletorio': supletorio}
        )
        serializer.is_valid(raise_exception=True)

        supletorio.nota = serializer.validated_data['nota']
        supletorio.nota_observaciones = serializer.validated_data.get('nota_observaciones', '')
        supletorio.estado = EstadoSupletorio.REALIZADO
        supletorio.save()

        admins = Usuario.objects.filter(rol__nombre='administrador', estado='aprobado')
        for admin in admins:
            NotificacionService.crear(
                usuario=admin,
                titulo='Supletorio calificado',
                mensaje=f'El supletorio de {supletorio.estudiante_nombre} ({supletorio.asignatura}) fue calificado con nota {supletorio.nota}.',
                tipo='examen_calificado',
                supletorio=supletorio,
            )

        estudiante = supletorio.usuario
        NotificacionService.crear(
            usuario=estudiante,
            titulo='Tu supletorio fue calificado',
            mensaje=f'Tu supletorio de {supletorio.asignatura} fue calificado. Nota: {supletorio.nota}.',
            tipo='examen_calificado',
            supletorio=supletorio,
        )

        return Response({'detail': 'Supletorio calificado correctamente'})
