from datetime import date, timedelta

COLOMBIAN_HOLIDAYS: set[date] = {
    # 2025
    date(2025, 1, 1),    # Año Nuevo
    date(2025, 1, 6),    # Día de los Reyes Magos
    date(2025, 3, 24),   # Lunes Santo
    date(2025, 4, 17),   # Jueves Santo
    date(2025, 4, 18),   # Viernes Santo
    date(2025, 5, 1),    # Día del Trabajo
    date(2025, 5, 26),   # Ascensión del Señor
    date(2025, 6, 16),   # Corpus Christi
    date(2025, 6, 23),   # Sagrado Corazón
    date(2025, 6, 29),   # San Pedro y San Pablo
    date(2025, 7, 20),   # Día de la Independencia
    date(2025, 8, 7),    # Batalla de Boyacá
    date(2025, 8, 18),   # Asunción de la Virgen
    date(2025, 10, 13),  # Día de la Raza
    date(2025, 11, 3),   # Todos los Santos
    date(2025, 11, 17),  # Independencia de Cartagena
    date(2025, 12, 8),   # Inmaculada Concepción
    date(2025, 12, 25),  # Navidad
    # 2026
    date(2026, 1, 1),    # Año Nuevo
    date(2026, 1, 12),   # Día de los Reyes Magos
    date(2026, 3, 23),   # Lunes Santo
    date(2026, 4, 2),    # Jueves Santo
    date(2026, 4, 3),    # Viernes Santo
    date(2026, 5, 1),    # Día del Trabajo
    date(2026, 6, 8),    # Ascensión del Señor
    date(2026, 6, 29),   # Corpus Christi
    date(2026, 7, 6),    # Sagrado Corazón
    date(2026, 7, 20),   # Día de la Independencia
    date(2026, 8, 7),    # Batalla de Boyacá
    date(2026, 8, 24),   # Asunción de la Virgen
    date(2026, 10, 12),  # Día de la Raza
    date(2026, 11, 2),   # Todos los Santos
    date(2026, 11, 16),  # Independencia de Cartagena
    date(2026, 12, 8),   # Inmaculada Concepción
    date(2026, 12, 25),  # Navidad
}


def es_dia_habil(fecha: date) -> bool:
    return fecha.weekday() < 5 and fecha not in COLOMBIAN_HOLIDAYS


def dias_habiles_entre(fecha_inicio: date, fecha_fin: date) -> int:
    count = 0
    actual = fecha_inicio
    while actual < fecha_fin:
        if es_dia_habil(actual):
            count += 1
        actual += timedelta(days=1)
    return count


def agregar_dias_habiles(fecha: date, n: int) -> date:
    resultado = fecha
    agregados = 0
    while agregados < n:
        resultado += timedelta(days=1)
        if es_dia_habil(resultado):
            agregados += 1
    return resultado
