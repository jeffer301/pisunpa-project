from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
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
            id_programa=1,
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
