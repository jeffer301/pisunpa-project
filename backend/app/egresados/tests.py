from datetime import date, timedelta
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from app.usuarios.models import Rol
from app.egresados.models import Evento, InscripcionEvento, Programa, PerfilEgresado

User = get_user_model()


def crear_usuario(email, rol_nombre, documento):
    rol, _ = Rol.objects.get_or_create(nombre=rol_nombre)
    return User.objects.create_user(
        username=email, email=email, password='pass123',
        documento=documento, rol=rol, estado='aprobado',
    )


@override_settings(ROOT_URLCONF='core_project.urls')
class EventosTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.coordinador = crear_usuario('coord@test.com', 'coordinador', 'E01')
        self.admin = crear_usuario('admin@test.com', 'administrador', 'E02')
        self.secretario = crear_usuario('sec@test.com', 'secretario', 'E03')
        self.egresado = crear_usuario('egr@test.com', 'egresado', 'E04')
        programa = Programa.objects.create(nombre='Ingeniería')
        self.perfil = PerfilEgresado.objects.create(
            usuario=self.egresado,
            tipo_documento='CC',
            numero_documento='E04',
            programa=programa,
            validado=True,
        )
        self.manana = date.today() + timedelta(days=1)
        self.ayer = date.today() - timedelta(days=1)

    def test_egresado_ve_solo_eventos_futuros(self):
        Evento.objects.create(nombre='Futuro', fecha=self.manana)
        Evento.objects.create(nombre='Pasado', fecha=self.ayer)
        self.client.force_authenticate(user=self.egresado)
        response = self.client.get('/api/egresados/eventos/')
        self.assertEqual(response.status_code, 200)
        nombres = [e['nombre'] for e in response.data]
        self.assertIn('Futuro', nombres)
        self.assertNotIn('Pasado', nombres)

    def test_secretario_puede_listar_eventos(self):
        Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.secretario)
        response = self.client.get('/api/egresados/eventos/')
        self.assertEqual(response.status_code, 200)

    def test_estudiante_no_puede_crear_evento(self):
        self.client.force_authenticate(user=self.egresado)
        response = self.client.post('/api/egresados/eventos/', {
            'nombre': 'No',
            'fecha': self.manana.isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_coordinador_crea_evento_y_notifica(self):
        from app.usuarios.models import Notificacion
        self.client.force_authenticate(user=self.coordinador)
        response = self.client.post('/api/egresados/eventos/', {
            'nombre': 'Encuentro de egresados',
            'descripcion': 'Reunión anual',
            'fecha': self.manana.isoformat(),
            'hora': '09:00:00',
            'lugar': 'Aula magna',
            'capacidad': 10,
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Evento.objects.filter(nombre='Encuentro de egresados').exists())
        self.assertTrue(
            Notificacion.objects.filter(
                usuario=self.secretario, tipo='evento_creado'
            ).exists()
        )

    def test_egresado_se_inscribe_con_snapshot(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.egresado)
        response = self.client.post(f'/api/egresados/eventos/{evento.id}/inscribirse/')
        self.assertEqual(response.status_code, 201)
        inscripcion = InscripcionEvento.objects.get(evento=evento, egresado=self.egresado)
        self.assertEqual(inscripcion.nombre_egresado, 'egr@test.com')
        self.assertEqual(inscripcion.documento_egresado, 'E04')

    def test_no_inscribe_a_capacidad_llena(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana, capacidad=1)
        egresado2 = crear_usuario('egr2@test.com', 'egresado', 'E05')
        PerfilEgresado.objects.create(
            usuario=egresado2, tipo_documento='CC', numero_documento='E05',
        )
        InscripcionEvento.objects.create(
            evento=evento, egresado=egresado2,
            nombre_egresado='egr2@test.com', documento_egresado='E05',
        )
        self.client.force_authenticate(user=self.egresado)
        response = self.client.post(f'/api/egresados/eventos/{evento.id}/inscribirse/')
        self.assertEqual(response.status_code, 400)

    def test_no_inscribe_a_evento_pasado(self):
        evento = Evento.objects.create(nombre='Pasado', fecha=self.ayer)
        self.client.force_authenticate(user=self.egresado)
        response = self.client.post(f'/api/egresados/eventos/{evento.id}/inscribirse/')
        self.assertEqual(response.status_code, 400)

    def test_cancelar_inscripcion_marca_cancelada(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        inscripcion = InscripcionEvento.objects.create(
            evento=evento, egresado=self.egresado,
            nombre_egresado='egr@test.com', documento_egresado='E04',
        )
        self.client.force_authenticate(user=self.egresado)
        response = self.client.delete(f'/api/egresados/eventos/{evento.id}/inscripcion/')
        self.assertEqual(response.status_code, 200)
        inscripcion.refresh_from_db()
        self.assertTrue(inscripcion.cancelada)

    def test_coordinador_lista_inscritos(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        InscripcionEvento.objects.create(
            evento=evento, egresado=self.egresado,
            nombre_egresado='egr@test.com', documento_egresado='E04',
        )
        self.client.force_authenticate(user=self.coordinador)
        response = self.client.get(f'/api/egresados/eventos/{evento.id}/inscritos/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_secretario_no_puede_ver_inscritos(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.secretario)
        response = self.client.get(f'/api/egresados/eventos/{evento.id}/inscritos/')
        self.assertEqual(response.status_code, 403)
