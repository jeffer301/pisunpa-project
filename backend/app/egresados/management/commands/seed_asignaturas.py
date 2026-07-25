from django.core.management.base import BaseCommand
from app.egresados.models import Asignatura, Programa


ASIGNATURAS_ING_SISTEMAS = [
    'ADMINISTRACION DE EMPRESAS',
    'ALGORITMIA',
    'ANALISIS DE SISTEMAS',
    'ANALISIS FINANCIERO',
    'ANALISIS NUMERICO',
    'ARQUITECTURA DE HARDWARE',
    'ARQUITECTURA DE SOFTWARE',
    'BASES DE DATOS',
    'CONTABILIDAD',
    'DESARROLLO FORMAL DE SOFTWARE',
    'DISEÑO DE SISTEMAS',
    'ELECTIVA 2',
    'ELECTIVA 3',
    'ELECTIVA INSTITUCIONAL I',
    'ELECTIVA INSTITUCIONAL II',
    'ELECTIVA PROFESIONAL I',
    'ELECTIVA PROFESIONAL II',
    'ELECTIVA PROFESIONAL III',
    'ELECTRONICA DIGITAL',
    'ESTRUCTURAS DE DATOS',
    'ÉTICA Y CONSTITUCIÓN',
    'FORMULACION DE PROYECTOS',
    'FUNDAMENTOS CONTROL Y AUTOMATIZACION',
    'FUNDAMENTOS DE INVESTIGACION',
    'FUNDAMENTOS DE REDES',
    'GESTION DE CALIDAD',
    'GESTION DE PROYECTOS',
    'GESTION DE TECNOLOGIA',
    'INGENIERIA DE PROCESOS',
    'INGENIERIA DEL SOFTWARE',
    'INGENIERIA ECONOMICA',
    'INGENIERIA LOGISTICA',
    'INTELIGENCIA ARTIFICIAL',
    'INTRODUCCION A LA INGENIERIA DE SISTEMAS',
    'INVESTIGACION DE OPERACIONES',
    'LABORATORIO TECNOLOGICO 1',
    'LABORATORIO TECNOLOGICO 2',
    'LABORATORIO TECNOLOGICO 3',
    'LÓGICA MATEMÁTICA',
    'MATEMATICAS DISCRETAS',
    'MERCADEO',
    'NEGOCIOS INTERNACIONALES',
    'PRACTICA EMPRESARIAL',
    'PROGRAMACION ORIENTADA A OBJETOS',
    'PROYECTO DE GRADO',
    'REDES Y SERVICIOS',
    'SEGURIDAD INFORMÁTICA',
    'SEMINARIO DE ACTUALIZACION I',
    'SEMINARIO DE ACTUALIZACION II',
    'SIMULACION COMPUTACIONAL',
    'SISTEMAS DE INFORMACION APLICADA',
    'SISTEMAS DE INFORMACION ORGANIZACIONAL',
    'SISTEMAS OPERATIVOS',
    'TEORIA DE SISTEMAS',
]


class Command(BaseCommand):
    help = 'Pobla la tabla de Asignaturas con las materias de Ingeniería de Sistemas'

    def handle(self, *args, **options):
        programa, _ = Programa.objects.get_or_create(
            nombre='Ingeniería de Sistemas'
        )

        creadas = 0
        existentes = 0
        for nombre in ASIGNATURAS_ING_SISTEMAS:
            _, created = Asignatura.objects.get_or_create(
                nombre=nombre,
                defaults={'programa': programa},
            )
            if created:
                creadas += 1
            else:
                existentes += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Asignaturas: {creadas} creadas, {existentes} ya existentes '
                f'(total: {creadas + existentes})'
            )
        )
