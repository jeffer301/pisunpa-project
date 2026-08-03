from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from app.usuarios.models import Rol

User = get_user_model()


@override_settings(ROOT_URLCONF='core_project.urls')
class SupletorioPermisosTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre='administrador')
        self.rol_director = Rol.objects.create(nombre='director')
        self.rol_secretario = Rol.objects.create(nombre='secretario')
        self.rol_estudiante = Rol.objects.create(nombre='estudiante')

        self.admin = User.objects.create_user(
            username='admin@test.com', email='admin@test.com',
            password='admin123', documento='S01', rol=self.rol_admin,
            estado='aprobado',
        )
        self.secretario = User.objects.create_user(
            username='sec@test.com', email='sec@test.com',
            password='sec123', documento='S02', rol=self.rol_secretario,
            estado='aprobado',
        )
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='est123', documento='S03', rol=self.rol_estudiante,
            estado='aprobado',
        )
        from app.supletorios.models import Supletorio
        self.supletorio = Supletorio.objects.create(
            estudiante_nombre='Estudiante Test',
            estudiante_email='est@test.com',
            fecha_parcial='2026-09-01',
            profesor='Prof A',
            asignatura='Matemáticas',
            grupo='1',
            descripcion='Solicitud de prueba',
        )

    def test_secretario_puede_leer_bandeja(self):
        self.client.force_authenticate(user=self.secretario)
        response = self.client.get('/api/supletorios/bandeja/')
        self.assertEqual(response.status_code, 200)

    def test_secretario_no_puede_aprobar(self):
        self.client.force_authenticate(user=self.secretario)
        response = self.client.post(
            f'/api/supletorios/bandeja/{self.supletorio.pk}/aprobar/'
        )
        self.assertEqual(response.status_code, 403)

    def test_admin_si_puede_aprobar(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f'/api/supletorios/bandeja/{self.supletorio.pk}/aprobar/'
        )
        self.assertEqual(response.status_code, 200)

    def test_aprobar_notifica_a_secretario(self):
        from app.usuarios.models import Notificacion
        self.client.force_authenticate(user=self.admin)
        self.client.post(f'/api/supletorios/bandeja/{self.supletorio.pk}/aprobar/')
        self.assertTrue(
            Notificacion.objects.filter(
                usuario=self.secretario, tipo='solicitud_aprobada'
            ).exists()
        )


@override_settings(ROOT_URLCONF='core_project.urls')
class SupletorioCreateTest(TestCase):
    def setUp(self):
        from app.egresados.models import Programa
        self.client = APIClient()
        self.rol_estudiante = Rol.objects.create(nombre='estudiante')
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='est123', documento='S10', rol=self.rol_estudiante,
            estado='aprobado',
        )
        self.programa = Programa.objects.create(nombre='Ingenieria De Sistemas')

    def _datos(self, **kwargs):
        data = {
            'fechaParcial': '2026-09-01',
            'profesor': 'Prof A',
            'asignatura': 'Matematicas',
            'grupoAsignatura': 'G1',
            'idPrograma': str(self.programa.pk),
            'descripcion': 'Solicitud de prueba',
            'comprobante_pago': SimpleUploadedFile(
                'recibo.png', b'fake-png-bytes', content_type='image/png'
            ),
        }
        data.update(kwargs)
        return data

    def _post(self, **kwargs):
        self.client.force_authenticate(user=self.estudiante)
        return self.client.post('/api/supletorios/solicitudes/', self._datos(**kwargs))

    def test_crear_solicitud_con_id_programa_uuid(self):
        from app.supletorios.models import Supletorio
        response = self._post()
        self.assertEqual(response.status_code, 201, response.content)
        supletorio = Supletorio.objects.get(pk=response.data['id'])
        self.assertEqual(supletorio.programa_nombre, self.programa.nombre)

    def test_crear_solicitud_con_asignatura_uuid(self):
        from app.egresados.models import Asignatura
        from app.supletorios.models import Supletorio
        asignatura = Asignatura.objects.create(nombre='Calculo Integral')
        response = self._post(asignatura=str(asignatura.pk))
        self.assertEqual(response.status_code, 201, response.content)
        supletorio = Supletorio.objects.get(pk=response.data['id'])
        self.assertEqual(supletorio.asignatura, 'Calculo Integral')

    def test_crear_solicitud_notifica_a_roles_admin(self):
        from app.usuarios.models import Notificacion, Rol
        roles = {
            nombre: Rol.objects.create(nombre=nombre)
            for nombre in ['administrador', 'director', 'secretario']
        }
        for nombre, rol in roles.items():
            User.objects.create_user(
                username=nombre, email=nombre + '@test.com', password='x123',
                documento=nombre, rol=rol, estado='aprobado',
            )
        response = self._post()
        self.assertEqual(response.status_code, 201, response.content)
        for username in roles:
            self.assertTrue(
                Notificacion.objects.filter(
                    usuario__username=username, tipo='solicitud_creada'
                ).exists(),
                f'No llego notificacion a {username}',
            )


@override_settings(ROOT_URLCONF='core_project.urls')
class MiSolicitudesTest(TestCase):
    def setUp(self):
        from app.supletorios.models import Supletorio
        self.client = APIClient()
        self.rol_estudiante = Rol.objects.create(nombre='estudiante')
        self.estudiante = User.objects.create_user(
            username='est@test.com', email='est@test.com',
            password='est123', documento='S11', rol=self.rol_estudiante,
            estado='aprobado',
        )
        self.otro = User.objects.create_user(
            username='otro@test.com', email='otro@test.com',
            password='otro123', documento='S12', rol=self.rol_estudiante,
            estado='aprobado',
        )
        self.mia = Supletorio.objects.create(
            estudiante_nombre='Estudiante Test', estudiante_email=self.estudiante.email,
            fecha_parcial='2026-09-01', profesor='Prof A', asignatura='Matemáticas',
            grupo='1', programa_nombre='Ingenieria De Sistemas',
            descripcion='Solicitud propia',
        )
        self.ajena = Supletorio.objects.create(
            estudiante_nombre='Otro Estudiante', estudiante_email=self.otro.email,
            fecha_parcial='2026-09-01', profesor='Prof B', asignatura='Física',
            grupo='2', programa_nombre='Ingenieria De Sistemas',
            descripcion='Solicitud ajena',
        )

    def test_estudiante_lista_solo_sus_solicitudes(self):
        self.client.force_authenticate(user=self.estudiante)
        response = self.client.get('/api/supletorios/mis-solicitudes/')
        self.assertEqual(response.status_code, 200)
        ids = [s['id'] for s in response.data]
        self.assertIn(self.mia.pk, ids)
        self.assertNotIn(self.ajena.pk, ids)

    def test_respuesta_incluye_campos_del_contrato(self):
        self.client.force_authenticate(user=self.estudiante)
        response = self.client.get('/api/supletorios/mis-solicitudes/')
        self.assertEqual(response.status_code, 200)
        item = response.data[0]
        for campo in ['id', 'asignatura', 'profesor', 'grupo', 'programa',
                      'fechaParcial', 'fechaSolicitud', 'estado', 'comprobanteNombre']:
            self.assertIn(campo, item)
