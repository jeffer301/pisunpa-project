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

    class Meta:
        model = Supletorio
        fields = ['id', 'estudiante', 'email', 'programa', 'asignatura', 'profesor', 'grupo',
                  'descripcion', 'fechaParcial', 'estadoSolicitud', 'estadoPago', 'comprobanteNombre']

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