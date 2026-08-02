from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient
from app.usuarios.models import Rol

User = get_user_model()


@override_settings(ROOT_URLCONF='core_project.urls')
class SeedUsuariosTest(TestCase):
    """El seed crea todos los roles y usuarios; el director es superusuario."""

    def test_seed_crea_roles_y_director_superusuario(self):
        for nombre in ['administrador', 'director', 'secretario', 'coordinador',
                       'profesor', 'egresado', 'estudiante']:
            Rol.objects.create(nombre=nombre)
        call_command('seed_usuarios')

        self.assertTrue(User.objects.filter(email='director@pisunpa.com').exists())
        self.assertTrue(User.objects.filter(email='secretario@pisunpa.com').exists())
        self.assertTrue(User.objects.filter(email='coordinador@pisunpa.com').exists())

        director = User.objects.get(email='director@pisunpa.com')
        self.assertTrue(director.is_superuser)
        self.assertTrue(director.is_staff)
        self.assertEqual(director.rol.nombre, 'director')

        coordinador = User.objects.get(email='coordinador@pisunpa.com')
        self.assertEqual(coordinador.rol.nombre, 'coordinador')


@override_settings(ROOT_URLCONF='core_project.urls')
class RegistroRestriccionDocenteTest(TestCase):
    """El registro público NO debe permitir rol docente.
    Solo /registro-docente/ debe habilitarlo."""

    def setUp(self):
        self.client = APIClient()
        self.rol_estudiante = Rol.objects.create(nombre='estudiante')
        self.rol_egresado = Rol.objects.create(nombre='egresado')
        self.rol_profesor = Rol.objects.create(nombre='profesor')
        from app.egresados.models import Programa
        self.programa = Programa.objects.create(nombre='Derecho')

    def test_registro_estudiante(self):
        response = self.client.post('/api/usuarios/registro-con-rol/', {
            'email': 'est@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'documento': '12345',
            'tipo_usuario': 'estudiante',
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_registro_egresado(self):
        response = self.client.post('/api/usuarios/registro-con-rol/', {
            'email': 'egr@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'documento': '67890',
            'tipo_usuario': 'egresado',
            'programa_id': str(self.programa.id),
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_registro_con_rol_rechaza_docente(self):
        response = self.client.post('/api/usuarios/registro-con-rol/', {
            'email': 'docente@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Test',
            'last_name': 'Docente',
            'documento': '99999',
            'tipo_usuario': 'docente',
        }, format='json')
        self.assertIn(response.status_code, [400, 403])

    def test_registro_docente_endpoint_si_funciona(self):
        response = self.client.post('/api/usuarios/registro-docente/', {
            'email': 'nuevodocente@test.com',
            'password': 'StrongPass1!',
            'password2': 'StrongPass1!',
            'first_name': 'Juan',
            'last_name': 'Perez',
            'documento_identidad': '88888',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email='nuevodocente@test.com')
        self.assertEqual(user.rol.nombre, 'profesor')


@override_settings(ROOT_URLCONF='core_project.urls')
class RegistroEstadoPendienteTest(TestCase):
    """Tanto estudiantes como egresados deben quedar pendiente_aprobacion."""

    def setUp(self):
        self.client = APIClient()
        Rol.objects.create(nombre='estudiante')
        Rol.objects.create(nombre='egresado')

    def test_estudiante_queda_pendiente(self):
        self.client.post('/api/usuarios/registro-con-rol/', {
            'email': 'est@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Est',
            'last_name': 'Test',
            'documento': '11111',
            'tipo_usuario': 'estudiante',
        }, format='json')
        user = User.objects.get(email='est@test.com')
        self.assertEqual(user.estado, 'pendiente_aprobacion')

    def test_egresado_queda_pendiente(self):
        from app.egresados.models import Programa
        programa = Programa.objects.create(nombre='Medicina')
        self.client.post('/api/usuarios/registro-con-rol/', {
            'email': 'egr@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'first_name': 'Egr',
            'last_name': 'Test',
            'documento': '22222',
            'tipo_usuario': 'egresado',
            'programa_id': str(programa.id),
        }, format='json')
        user = User.objects.get(email='egr@test.com')
        self.assertEqual(user.estado, 'pendiente_aprobacion')


@override_settings(ROOT_URLCONF='core_project.urls')
class AprobacionRechazoTest(TestCase):
    """Flujo de aprobación/rechazo de solicitudes pendientes."""

    def setUp(self):
        self.client = APIClient()
        rol_admin = Rol.objects.create(nombre='administrador')
        self.admin = User.objects.create_user(
            username='admin@test.com', email='admin@test.com',
            password='admin123', documento='001', rol=rol_admin,
            estado='aprobado',
        )
        rol_est = Rol.objects.create(nombre='estudiante')
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='test123', documento='002', rol=rol_est,
            estado='pendiente_aprobacion',
        )
        self.client.force_authenticate(user=self.admin)

    def test_listar_pendientes(self):
        response = self.client.get('/api/usuarios/estudiantes-pendientes/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_aprobar_estudiante(self):
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.estudiante.id}/aprobar/'
        )
        self.assertEqual(response.status_code, 200)
        self.estudiante.refresh_from_db()
        self.assertEqual(self.estudiante.estado, 'aprobado')

    def test_rechazar_estudiante(self):
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.estudiante.id}/rechazar/'
        )
        self.assertEqual(response.status_code, 200)
        self.estudiante.refresh_from_db()
        self.assertEqual(self.estudiante.estado, 'rechazado')


@override_settings(ROOT_URLCONF='core_project.urls')
class PromocionEstudianteAEgresadoTest(TestCase):
    """Promover estudiante a egresado preservando el UUID."""

    def setUp(self):
        self.client = APIClient()
        rol_admin = Rol.objects.create(nombre='administrador')
        self.admin = User.objects.create_user(
            username='admin@test.com', email='admin@test.com',
            password='admin123', documento='001', rol=rol_admin,
            estado='aprobado',
        )
        rol_est = Rol.objects.create(nombre='estudiante')
        Rol.objects.create(nombre='egresado')
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='test123', documento='002', rol=rol_est,
            estado='aprobado',
        )
        self.client.force_authenticate(user=self.admin)

    def test_promover_cambia_rol_y_preserva_uuid(self):
        uuid_original = self.estudiante.id
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.estudiante.id}/promover-egresado/',
            {},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.estudiante.refresh_from_db()
        self.assertEqual(self.estudiante.rol.nombre, 'egresado')
        self.assertEqual(self.estudiante.id, uuid_original)
        self.assertTrue(hasattr(self.estudiante, 'perfil_egresado'))


@override_settings(ROOT_URLCONF='core_project.urls')
class ProgramasSinDuplicadosTest(TestCase):
    """El endpoint de programas no debe devolver duplicados."""

    def setUp(self):
        from app.egresados.models import Programa
        Programa.objects.create(nombre='Ingeniería de Sistemas')
        Programa.objects.create(nombre='Derecho')
        Programa.objects.create(nombre='Medicina')

    def test_programas_unicos(self):
        client = APIClient()
        response = client.get('/api/egresados/programas/')
        self.assertEqual(response.status_code, 200)
        nombres = [p['nombre'] for p in response.data]
        self.assertEqual(len(nombres), len(set(nombres)))


@override_settings(ROOT_URLCONF='core_project.urls')
class GestionUsuariosTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='administrador')
        self.rol_director = Rol.objects.create(nombre='director')
        self.rol_secretario = Rol.objects.create(nombre='secretario')
        self.rol_estudiante = Rol.objects.create(nombre='estudiante')
        Rol.objects.create(nombre='coordinador')

        self.admin = User.objects.create_user(
            username='admin@test.com', email='admin@test.com',
            password='admin123', documento='A01', rol=self.rol_admin,
            estado='aprobado',
        )
        self.director = User.objects.create_user(
            username='dir@test.com', email='dir@test.com',
            password='dir123', documento='A02', rol=self.rol_director,
            estado='aprobado', is_superuser=True, is_staff=True,
        )
        self.secretario = User.objects.create_user(
            username='sec@test.com', email='sec@test.com',
            password='sec123', documento='A03', rol=self.rol_secretario,
            estado='aprobado',
        )
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='est123', documento='A04', rol=self.rol_estudiante,
            estado='aprobado',
        )

    def test_listar_usuarios_requiere_admin_lectura(self):
        self.client.force_authenticate(user=self.secretario)
        response = self.client.get('/api/usuarios/usuarios/')
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 4)

    def test_listar_usuarios_rechaza_estudiante(self):
        self.client.force_authenticate(user=self.estudiante)
        response = self.client.get('/api/usuarios/usuarios/')
        self.assertEqual(response.status_code, 403)

    def test_listar_filtra_por_q(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/usuarios/usuarios/?q=est@test.com')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'est@test.com')

    def test_cambiar_rol_por_administrador(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.estudiante.id}/rol/',
            {'rol': 'secretario'}, format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.estudiante.refresh_from_db()
        self.assertEqual(self.estudiante.rol.nombre, 'secretario')

    def test_admin_no_puede_cambiar_rol_del_director(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.director.id}/rol/',
            {'rol': 'secretario'}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_no_puede_cambiarse_propio_rol(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.admin.id}/rol/',
            {'rol': 'director'}, format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_secretario_no_puede_cambiar_rol(self):
        self.client.force_authenticate(user=self.secretario)
        response = self.client.patch(
            f'/api/usuarios/usuarios/{self.estudiante.id}/rol/',
            {'rol': 'secretario'}, format='json'
        )
        self.assertEqual(response.status_code, 403)

    def test_crear_admin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/usuarios/usuarios/crear-admin/', {
            'email': 'nuevo.admin@test.com',
            'first_name': 'Nuevo',
            'last_name': 'Admin',
            'documento': 'A99',
            'password': 'StrongPass1!',
            'rol': 'coordinador',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        usuario = User.objects.get(email='nuevo.admin@test.com')
        self.assertEqual(usuario.rol.nombre, 'coordinador')
        self.assertEqual(usuario.estado, 'aprobado')

    def test_crear_admin_no_acepta_director(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/usuarios/usuarios/crear-admin/', {
            'email': 'falso.director@test.com',
            'first_name': 'Falso',
            'last_name': 'Director',
            'documento': 'A98',
            'password': 'StrongPass1!',
            'rol': 'director',
        }, format='json')
        self.assertEqual(response.status_code, 400)


@override_settings(ROOT_URLCONF='core_project.urls')
class NotificacionFanOutTest(TestCase):
    def setUp(self):
        from app.usuarios.models import Notificacion
        self.Notificacion = Notificacion
        self.rol_secretario = Rol.objects.create(nombre='secretario')
        self.rol_coordinador = Rol.objects.create(nombre='coordinador')
        self.rol_egresado = Rol.objects.create(nombre='egresado')
        self.secretario = User.objects.create_user(
            username='sec@test.com', email='sec@test.com',
            password='sec123', documento='F01', rol=self.rol_secretario,
            estado='aprobado',
        )
        self.coordinador = User.objects.create_user(
            username='coord@test.com', email='coord@test.com',
            password='coord123', documento='F02', rol=self.rol_coordinador,
            estado='aprobado',
        )
        self.egresado = User.objects.create_user(
            username='egr@test.com', email='egr@test.com',
            password='egr123', documento='F03', rol=self.rol_egresado,
            estado='aprobado',
        )

    def test_crear_hace_fan_out_a_roles(self):
        from app.usuarios.notification_service import NotificacionService
        NotificacionService.crear(
            usuario=self.egresado,
            titulo='Evento nuevo',
            mensaje='Se creó un evento.',
            tipo='evento_creado',
            roles_broadcast=['secretario', 'coordinador'],
        )
        self.assertTrue(
            self.Notificacion.objects.filter(usuario=self.secretario).exists()
        )
        self.assertTrue(
            self.Notificacion.objects.filter(usuario=self.coordinador).exists()
        )
        self.assertTrue(
            self.Notificacion.objects.filter(usuario=self.egresado).exists()
        )

    def test_broadcast_no_duplica_ni_incluye_no_roles(self):
        from app.usuarios.notification_service import NotificacionService
        NotificacionService.crear(
            usuario=self.secretario,
            titulo='Prueba',
            mensaje='Mensaje',
            tipo='evento_inscripcion',
            roles_broadcast=['secretario', 'coordinador'],
        )
        self.assertEqual(
            self.Notificacion.objects.filter(usuario=self.secretario).count(), 1
        )
        self.assertFalse(
            self.Notificacion.objects.filter(usuario=self.egresado).exists()
        )

    def test_default_broadcast_es_secretario(self):
        from app.usuarios.notification_service import NotificacionService
        NotificacionService.crear(
            usuario=self.egresado,
            titulo='Inscripción',
            mensaje='Te inscribiste.',
            tipo='evento_inscripcion',
        )
        self.assertTrue(
            self.Notificacion.objects.filter(usuario=self.secretario).exists()
        )


@override_settings(ROOT_URLCONF='core_project.urls')
class NotificacionesTest(TestCase):
    """Conteo y marcado de notificaciones."""

    def setUp(self):
        self.client = APIClient()
        rol = Rol.objects.create(nombre='administrador')
        self.user = User.objects.create_user(
            username='notif@test.com', email='notif@test.com',
            password='test123', documento='003', rol=rol,
            estado='aprobado',
        )
        self.client.force_authenticate(user=self.user)
        from app.usuarios.models import Notificacion
        Notificacion.objects.create(
            usuario=self.user, titulo='Test 1', mensaje='Mensaje 1',
            tipo='solicitud_creada',
        )
        Notificacion.objects.create(
            usuario=self.user, titulo='Test 2', mensaje='Mensaje 2',
            tipo='solicitud_aprobada', leido=True,
        )

    def test_contar_no_leidas(self):
        response = self.client.get('/api/usuarios/notificaciones/contar-no-leidas/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)

    def test_listar_notificaciones(self):
        response = self.client.get('/api/usuarios/notificaciones/')
        self.assertEqual(response.status_code, 200)

    def test_marcar_como_leida(self):
        from app.usuarios.models import Notificacion
        notif = Notificacion.objects.filter(leido=False).first()
        response = self.client.patch(f'/api/usuarios/notificaciones/{notif.id}/leer/')
        self.assertEqual(response.status_code, 200)
        notif.refresh_from_db()
        self.assertTrue(notif.leido)
