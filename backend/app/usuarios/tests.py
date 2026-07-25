from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from .models import Rol
from .serializers import CustomTokenObtainSerializer, RegistroDocenteSerializer

Usuario = get_user_model()


class RegistroDocenteDuplicateDocumentoTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_profesor = Rol.objects.create(nombre="profesor")
        Usuario.objects.create_user(
            username="existing@uni.com",
            email="existing@uni.com",
            password="testpass123",
            documento="99999",
            estado="aprobado",
        )
        self.valid_data = {
            "email": "newdocente@uni.com",
            "password": "StrongPass1!",
            "password2": "StrongPass1!",
            "first_name": "Juan",
            "last_name": "Perez",
            "documento_identidad": "99999",
        }

    def test_duplicate_documento_identidad_returns_400(self):
        response = self.client.post(
            "/api/usuarios/registro-docente/",
            self.valid_data,
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_unique_documento_identidad_returns_201(self):
        self.valid_data["documento_identidad"] = "11111"
        self.valid_data["email"] = "other@uni.com"
        response = self.client.post(
            "/api/usuarios/registro-docente/",
            self.valid_data,
            format="json",
        )
        self.assertEqual(response.status_code, 201)


class CustomLoginBlockTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            username="testuser",
            email="test@test.com",
            password="testpass123",
            documento="12345",
            estado="aprobado",
        )

    def test_aprobado_user_can_login(self):
        response = self.client.post(
            "/api/usuarios/login/",
            {"email": "test@test.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_pendiente_user_blocked(self):
        self.user.estado = "pendiente_aprobacion"
        self.user.save()
        response = self.client.post(
            "/api/usuarios/login/",
            {"email": "test@test.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_rechazado_user_blocked(self):
        self.user.estado = "rechazado"
        self.user.save()
        response = self.client.post(
            "/api/usuarios/login/",
            {"email": "test@test.com", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)


from .models import Notificacion, Usuario, Rol
from .notification_service import NotificacionService


class NotificacionServiceTest(TestCase):
    def setUp(self):
        self.rol = Rol.objects.create(nombre='estudiante')
        self.user = Usuario.objects.create_user(
            username='test@test.com', email='test@test.com',
            password='test1234', documento='111', estado='aprobado',
            rol=self.rol
        )

    def test_crear_notificacion(self):
        notif = NotificacionService.crear(
            usuario=self.user,
            titulo='Test',
            mensaje='Mensaje de prueba',
            tipo='solicitud_creada'
        )
        self.assertEqual(notif.titulo, 'Test')
        self.assertFalse(notif.leido)

    def test_contar_no_leidas(self):
        NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        NotificacionService.crear(self.user, 'N2', 'm2', 'solicitud_aprobada')
        self.assertEqual(NotificacionService.contar_no_leidas(self.user), 2)

    def test_marcar_como_leida(self):
        notif = NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        result = NotificacionService.marcar_como_leida(str(notif.id), self.user)
        self.assertTrue(result)
        notif.refresh_from_db()
        self.assertTrue(notif.leido)

    def test_obtener_solo_no_leidas(self):
        n1 = NotificacionService.crear(self.user, 'N1', 'm1', 'solicitud_creada')
        NotificacionService.crear(self.user, 'N2', 'm2', 'solicitud_aprobada')
        NotificacionService.marcar_como_leida(str(n1.id), self.user)
        qs = NotificacionService.obtener_notificaciones(self.user, solo_no_leidas=True)
        self.assertEqual(qs.count(), 1)
