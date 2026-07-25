from django.utils import timezone
from rest_framework import serializers
from .models import Supletorio, AnexoSupletorio, EstadoSupletorio


class SupletorioCreateSerializer(serializers.ModelSerializer):
    fechaParcial = serializers.DateField(source='fecha_parcial')
    grupoAsignatura = serializers.CharField(source='grupo')
    idPrograma = serializers.UUIDField(source='programa_id')
    anexos = serializers.ListField(
        child=serializers.FileField(), write_only=True, required=False
    )

    class Meta:
        model = Supletorio
        fields = ['id', 'fechaParcial', 'profesor', 'asignatura', 'grupoAsignatura',
                  'idPrograma', 'descripcion', 'anexos']

    def create(self, validated_data):
        anexos_data = validated_data.pop('anexos', [])
        request = self.context['request']
        usuario = request.user

        from app.egresados.models import Programa
        programa = Programa.objects.get(pk=validated_data.pop('programa_id'))
        validated_data['programa'] = programa
        validated_data['programa_nombre'] = programa.nombre

        supletorio = Supletorio.objects.create(
            usuario=usuario,
            estudiante_nombre=usuario.get_full_name() or usuario.get_username(),
            estudiante_email=usuario.email,
            estado=EstadoSupletorio.PENDIENTE,
            **validated_data,
        )

        for archivo in anexos_data:
            AnexoSupletorio.objects.create(
                supletorio=supletorio, archivo=archivo
            )

        return supletorio


class SupletorioBandejaSerializer(serializers.ModelSerializer):
    """Contrato exacto que espera bandeja-supletorios.component.ts (admin)."""
    estudiante = serializers.CharField(source='estudiante_nombre')
    email = serializers.EmailField(source='estudiante_email')
    programa = serializers.CharField(source='programa_nombre')
    fechaParcial = serializers.DateField(source='fecha_parcial')
    estadoSolicitud = serializers.SerializerMethodField()
    estadoPago = serializers.SerializerMethodField()
    comprobanteNombre = serializers.SerializerMethodField()
    fechaExamen = serializers.DateField(source='fecha_examen_supletorio', default=None)
    nota = serializers.IntegerField(default=None)

    class Meta:
        model = Supletorio
        fields = ['id', 'estudiante', 'email', 'programa', 'asignatura', 'profesor', 'grupo',
                  'descripcion', 'fechaParcial', 'estadoSolicitud', 'estadoPago', 'comprobanteNombre',
                  'fechaExamen', 'nota']

    def get_estadoSolicitud(self, obj):
        if obj.estado in (EstadoSupletorio.PENDIENTE, EstadoSupletorio.EN_REVISION):
            return 'pendiente'
        if obj.estado == EstadoSupletorio.RECHAZADA:
            return 'rechazada'
        return 'aprobada'

    def get_estadoPago(self, obj):
        if obj.estado == EstadoSupletorio.COMPROBANTE_SUBIDO:
            return 'comprobante_subido'
        if obj.estado in (EstadoSupletorio.NOTIFICADO_PROFESOR, EstadoSupletorio.REALIZADO):
            return 'pagado'
        return 'pendiente'

    def get_comprobanteNombre(self, obj):
        return obj.comprobante_pago.name.split('/')[-1] if obj.comprobante_pago else None


class SupletorioPendienteSerializer(serializers.ModelSerializer):
    """Contrato exacto que espera supletorios-pendientes.component.ts (profesor)."""
    estudiante = serializers.CharField(source='estudiante_nombre')
    programa = serializers.CharField(source='programa_nombre')
    fechaParcial = serializers.DateField(source='fecha_parcial')
    estado = serializers.SerializerMethodField()

    class Meta:
        model = Supletorio
        fields = ['id', 'estudiante', 'programa', 'asignatura', 'grupo', 'fechaParcial', 'estado']

    def get_estado(self, obj):
        return 'realizado' if obj.estado == EstadoSupletorio.REALIZADO else 'listo'


class SupletorioMiSolicitudSerializer(serializers.ModelSerializer):
    """Resumen de solicitud para el estudiante que la creó."""
    fechaParcial = serializers.DateField(source='fecha_parcial')
    fechaSolicitud = serializers.DateField(source='fecha_solicitud')
    programa = serializers.CharField(source='programa_nombre')
    estado = serializers.SerializerMethodField()
    comprobanteNombre = serializers.SerializerMethodField()

    class Meta:
        model = Supletorio
        fields = ['id', 'asignatura', 'profesor', 'grupo', 'programa',
                  'fechaParcial', 'fechaSolicitud', 'estado', 'comprobanteNombre']

    def get_estado(self, obj):
        return obj.estado

    def get_comprobanteNombre(self, obj):
        return obj.comprobante_pago.name.split('/')[-1] if obj.comprobante_pago else None


from datetime import date
from app.usuarios.notification_service import NotificacionService
from app.usuarios.models import Usuario
from .business_days import dias_habiles_entre


class CalificarExamenSerializer(serializers.Serializer):
    nota = serializers.IntegerField(min_value=0, max_value=100)
    nota_observaciones = serializers.CharField(required=False, default='', allow_blank=True)

    def validate(self, attrs):
        supletorio = self.context['supletorio']
        if supletorio.estado not in (EstadoSupletorio.NOTIFICADO_PROFESOR, EstadoSupletorio.AGENDADO):
            raise serializers.ValidationError("Solo se pueden calificar supletorios notificados o agendados.")
        return attrs


class AgendarExamenSerializer(serializers.Serializer):
    fecha_examen_supletorio = serializers.DateField()

    def validate_fecha_examen_supletorio(self, value):
        if value < date.today():
            raise serializers.ValidationError("La fecha no puede ser en el pasado.")
        return value

    def validate(self, attrs):
        supletorio = self.context['supletorio']
        if supletorio.estado != EstadoSupletorio.NOTIFICADO_PROFESOR:
            raise serializers.ValidationError("Solo se pueden agendar supletorios notificados al profesor.")
        desde = supletorio.actualizado_en.date()
        hasta = attrs['fecha_examen_supletorio']
        dias = dias_habiles_entre(desde, hasta)
        if dias > 10:
            raise serializers.ValidationError(
                f"La fecha excede los 10 días hábiles permitidos ({dias} días desde la confirmación)."
            )
        return attrs