from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from .serializers import CustomTokenObtainSerializer

Usuario = get_user_model()


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
