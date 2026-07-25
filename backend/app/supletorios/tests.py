from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from app.usuarios.models import Rol
from .models import Supletorio, EstadoSupletorio
from .business_days import es_dia_habil, dias_habiles_entre, agregar_dias_habiles


class EsDiaHabilTest(TestCase):
    def test_weekday_not_holiday_is_habil(self):
        # Wednesday 2025-07-16 — no holiday
        self.assertTrue(es_dia_habil(date(2025, 7, 16)))

    def test_saturday_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 7, 19)))

    def test_sunday_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 7, 20)))

    def test_colombian_holiday_is_not_habil(self):
        # July 20 — Día de la Independencia
        self.assertFalse(es_dia_habil(date(2025, 7, 20)))

    def test_new_years_day_is_not_habil(self):
        self.assertFalse(es_dia_habil(date(2025, 1, 1)))


class DiasHabilesEntreTest(TestCase):
    def test_five_weekdays_returns_5(self):
        # Mon Jul 14 to Fri Jul 18 = 5 business days
        result = dias_habiles_entre(date(2025, 7, 14), date(2025, 7, 19))
        self.assertEqual(result, 5)

    def test_excludes_weekend(self):
        # Mon Jul 14 to Mon Jul 21 = 5 business days (Mon-Fri, skip Sat/Sun)
        result = dias_habiles_entre(date(2025, 7, 14), date(2025, 7, 21))
        self.assertEqual(result, 5)

    def test_same_date_returns_0(self):
        result = dias_habiles_entre(date(2025, 7, 16), date(2025, 7, 16))
        self.assertEqual(result, 0)


class AgregarDiasHabilesTest(TestCase):
    def test_add_5_days_from_monday(self):
        # Mon Jul 14 + 5 = next Mon Jul 21
        result = agregar_dias_habiles(date(2025, 7, 14), 5)
        self.assertEqual(result, date(2025, 7, 21))

    def test_add_1_day_from_friday(self):
        # Fri Jul 18 + 1 = next Mon Jul 21 (skip weekend)
        result = agregar_dias_habiles(date(2025, 7, 18), 1)
        self.assertEqual(result, date(2025, 7, 21))


User = get_user_model()


class AgendarExamenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_prof = Rol.objects.create(nombre='profesor')
        self.profesor = User.objects.create_user(
            username='prof@test.com', email='prof@test.com',
            password='test1234', documento='333', estado='aprobado',
            rol=self.rol_prof
        )
        self.supletorio = Supletorio.objects.create(
            usuario=self.profesor,
            estudiante_nombre='Juan',
            estudiante_email='juan@test.com',
            fecha_parcial=date(2025, 6, 1),
            profesor='Profesor Test',
            asignatura='Matemáticas',
            grupo='A',
            descripcion='Test',
            estado=EstadoSupletorio.NOTIFICADO_PROFESOR,
        )
        self.client.force_authenticate(user=self.profesor)

    def test_agendar_exito(self):
        fecha = date.today() + timedelta(days=3)
        while not es_dia_habil(fecha):
            fecha += timedelta(days=1)
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/agendar/',
            {'fecha_examen_supletorio': fecha.isoformat()},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.supletorio.refresh_from_db()
        self.assertEqual(str(self.supletorio.fecha_examen_supletorio), fecha.isoformat())
        self.assertEqual(self.supletorio.estado, EstadoSupletorio.AGENDADO)

    def test_agendar_estado_invalido(self):
        self.supletorio.estado = EstadoSupletorio.PENDIENTE
        self.supletorio.save()
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/agendar/',
            {'fecha_examen_supletorio': date.today().isoformat()},
            format='json'
        )
        self.assertEqual(response.status_code, 400)


class CalificarExamenViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.rol_prof = Rol.objects.create(nombre='profesor')
        self.profesor = User.objects.create_user(
            username='prof2@test.com', email='prof2@test.com',
            password='test1234', documento='444', estado='aprobado',
            rol=self.rol_prof
        )
        self.supletorio = Supletorio.objects.create(
            usuario=self.profesor,
            estudiante_nombre='Maria',
            estudiante_email='maria@test.com',
            fecha_parcial=date(2025, 6, 1),
            profesor='Profesor Test',
            asignatura='Física',
            grupo='B',
            descripcion='Test',
            estado=EstadoSupletorio.NOTIFICADO_PROFESOR,
        )
        self.client.force_authenticate(user=self.profesor)

    def test_calificar_exito(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': 85, 'nota_observaciones': 'Buen desempeño'},
            format='json'
        )
        self.assertEqual(response.status_code, 200)
        self.supletorio.refresh_from_db()
        self.assertEqual(self.supletorio.nota, 85)
        self.assertEqual(self.supletorio.estado, EstadoSupletorio.REALIZADO)

    def test_calificar_nota_fuera_rango(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': 150},
            format='json'
        )
        self.assertEqual(response.status_code, 400)

    def test_calificar_nota_negativa(self):
        response = self.client.patch(
            f'/api/supletorios/pendientes/{self.supletorio.id}/calificar/',
            {'nota': -5},
            format='json'
        )
        self.assertEqual(response.status_code, 400)
