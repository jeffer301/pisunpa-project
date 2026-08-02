from django.core.management.base import BaseCommand
from app.usuarios.models import Rol, Usuario


USUARIOS = [
    {
        'email': 'director@pisunpa.com',
        'password': 'director123',
        'first_name': 'Directora',
        'last_name': 'PISUNPA',
        'rol_nombre': 'director',
        'documento': '00000001',
        'is_superuser': True,
        'is_staff': True,
    },
    {
        'email': 'admin@pisunpa.com',
        'password': 'administrador123',
        'first_name': 'Admin',
        'last_name': 'PISUNPA',
        'rol_nombre': 'administrador',
        'documento': '00000002',
    },
    {
        'email': 'secretario@pisunpa.com',
        'password': 'secretario123',
        'first_name': 'Secretario',
        'last_name': 'PISUNPA',
        'rol_nombre': 'secretario',
        'documento': '00000003',
    },
    {
        'email': 'coordinador@pisunpa.com',
        'password': 'coordinador123',
        'first_name': 'Coordinador',
        'last_name': 'Egresados',
        'rol_nombre': 'coordinador',
        'documento': '00000004',
    },
    {
        'email': 'profesor@pisunpa.com',
        'password': 'profesor123',
        'first_name': 'Profesor',
        'last_name': 'PISUNPA',
        'rol_nombre': 'profesor',
        'documento': '00000005',
    },
    {
        'email': 'estudiante@pisunpa.com',
        'password': 'estudiante123',
        'first_name': 'Estudiante',
        'last_name': 'PISUNPA',
        'rol_nombre': 'estudiante',
        'documento': '00000006',
    },
    {
        'email': 'egresado@pisunpa.com',
        'password': 'egresado123',
        'first_name': 'Egresado',
        'last_name': 'PISUNPA',
        'rol_nombre': 'egresado',
        'documento': '00000007',
    },
]


class Command(BaseCommand):
    help = 'Crea los usuarios de prueba con sus roles'

    def handle(self, *args, **options):
        rol_nombres = {u['rol_nombre'] for u in USUARIOS}
        for nombre in rol_nombres:
            Rol.objects.get_or_create(nombre=nombre)

        creados = 0
        actualizados = 0
        for data in USUARIOS:
            rol = Rol.objects.get(nombre=data['rol_nombre'])
            usuario, created = Usuario.objects.get_or_create(
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
                usuario.set_password(data['password'])
                usuario.save()
                creados += 1
                self.stdout.write(f'  + {data["email"]} ({data["rol_nombre"]})')
            else:
                actualizados += 1
                self.stdout.write(f'  = {data["email"]} ya existe')

            if data.get('is_superuser'):
                usuario.is_superuser = True
                usuario.is_staff = True
                usuario.save(update_fields=['is_superuser', 'is_staff'])

        self.stdout.write(
            self.style.SUCCESS(f'Usuarios: {creados} creados, {actualizados} ya existentes')
        )
