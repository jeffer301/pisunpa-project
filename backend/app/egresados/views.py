from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Departamento, Ciudad, Programa
from .serializers import DepartamentoSerializer, CiudadSerializer, ProgramaSerializer


class ProgramaListView(generics.ListAPIView):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
    permission_classes = [AllowAny]  # catálogo público, no requiere login


class DepartamentoListView(generics.ListAPIView):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializer
    permission_classes = [AllowAny]


class CiudadListView(generics.ListAPIView):
    serializer_class = CiudadSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Ciudad.objects.all()
        id_departamento = self.request.query_params.get('idDepartamento')
        if id_departamento:
            queryset = queryset.filter(departamento_id=id_departamento)
        return queryset
