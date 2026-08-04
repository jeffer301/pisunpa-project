from datetime import date, timedelta
import base64
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from app.usuarios.models import Rol
from app.egresados.models import Evento, InscripcionEvento, Programa, PerfilEgresado

User = get_user_model()

PNG_1X1 = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
)


def imagen_png(nombre='evento.png'):
    return SimpleUploadedFile(nombre, PNG_1X1, content_type='image/png')


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
        self.director = crear_usuario('dir@test.com', 'director', 'E06')
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

    def test_coordinador_crea_evento_sin_imagen(self):
        self.client.force_authenticate(user=self.coordinador)
        response = self.client.post('/api/egresados/eventos/', {
            'nombre': 'Sin imagen',
            'fecha': self.manana.isoformat(),
        }, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertFalse(Evento.objects.get(nombre='Sin imagen').imagen)
        self.assertIsNone(response.data.get('imagen'))

    def test_coordinador_crea_evento_con_imagen(self):
        self.client.force_authenticate(user=self.coordinador)
        response = self.client.post('/api/egresados/eventos/', {
            'nombre': 'Con imagen',
            'fecha': self.manana.isoformat(),
            'imagen': imagen_png(),
        }, format='multipart')
        self.assertEqual(response.status_code, 201)
        evento = Evento.objects.get(nombre='Con imagen')
        self.assertTrue(evento.imagen)
        self.assertTrue(evento.imagen.name.startswith('eventos/'))
        self.assertTrue(response.data.get('imagen'))

    def test_coordinador_actualiza_imagen(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.coordinador)
        response = self.client.patch(
            f'/api/egresados/eventos/{evento.id}/',
            {'imagen': imagen_png()},
            format='multipart',
        )
        self.assertEqual(response.status_code, 200)
        evento.refresh_from_db()
        self.assertTrue(evento.imagen)

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
        self.assertTrue(
            Notificacion.objects.filter(
                usuario=self.director, tipo='evento_creado'
            ).exists(),
            'El director no recibió la notificación del evento creado',
        )
        self.assertTrue(
            Notificacion.objects.filter(
                usuario=self.admin, tipo='evento_creado'
            ).exists(),
            'El administrador no recibió la notificación del evento creado',
        )
        self.assertTrue(
            Notificacion.objects.filter(
                usuario=self.egresado, tipo='evento_creado'
            ).exists(),
            'El egresado no recibió la notificación del evento creado',
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

    def test_secretario_puede_ver_inscritos(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.secretario)
        response = self.client.get(f'/api/egresados/eventos/{evento.id}/inscritos/')
        self.assertEqual(response.status_code, 200)

    def test_egresado_no_puede_ver_inscritos(self):
        evento = Evento.objects.create(nombre='Futuro', fecha=self.manana)
        self.client.force_authenticate(user=self.egresado)
        response = self.client.get(f'/api/egresados/eventos/{evento.id}/inscritos/')
        self.assertEqual(response.status_code, 403)
