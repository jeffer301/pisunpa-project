from rest_framework import serializers
from .models import Departamento, Ciudad, Programa


class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nombre']


class CiudadSerializer(serializers.ModelSerializer):
    idDepartamento = serializers.IntegerField(source='departamento_id')

    class Meta:
        model = Ciudad
        fields = ['id', 'nombre', 'idDepartamento']


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = ['id', 'nombre']