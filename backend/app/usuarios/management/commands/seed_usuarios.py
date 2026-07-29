from django.core.management.base import BaseCommand
from app.usuarios.models import Rol, Usuario


USUARIOS = [
    {
        'email': 'admin@pisunpa.com',
        'password': 'administrador123',
        'first_name': 'Admin',
        'last_name': 'PISUNPA',
        'rol_nombre': 'administrador',
        'documento': '00000001',
    },
    {
        'email': 'profesor@pisunpa.com',
        'password': 'profesor123',
        'first_name': 'Profesor',
        'last_name': 'PISUNPA',
        'rol_nombre': 'profesor',
        'documento': '00000002',
    },
    {
        'email': 'estudiante@pisunpa.com',
        'password': 'estudiante123',
        'first_name': 'Estudiante',
        'last_name': 'PISUNPA',
        'rol_nombre': 'estudiante',
        'documento': '00000003',
    },
    {
        'email': 'egresado@pisunpa.com',
        'password': 'egresado123',
        'first_name': 'Egresado',
        'last_name': 'PISUNPA',
        'rol_nombre': 'egresado',
        'documento': '00000004',
    },
]


class Command(BaseCommand):
    help = 'Crea los 4 usuarios de prueba con sus roles'

    def handle(self, *args, **options):
        rol_nombres = {u['rol_nombre'] for u in USUARIOS}
        for nombre in rol_nombres:
            Rol.objects.get_or_create(nombre=nombre)

        creados = 0
        for data in USUARIOS:
            rol = Rol.objects.get(nombre=data['rol_nombre'])
            _, created = Usuario.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'documento': data['documento'],
                    'rol': rol,
                    'estado': 'aprobado',
                },
            )
            if created:
                usuario = Usuario.objects.get(email=data['email'])
                usuario.set_password(data['password'])
                usuario.save()
                creados += 1
                self.stdout.write(f'  + {data["email"]} ({data["rol_nombre"]})')
            else:
                self.stdout.write(f'  = {data["email"]} ya existe')

        self.stdout.write(
            self.style.SUCCESS(f'Usuarios: {creados} creados')
        )
