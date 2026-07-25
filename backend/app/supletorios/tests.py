from datetime import date
from django.test import TestCase
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
