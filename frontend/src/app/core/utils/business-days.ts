const COLOMBIAN_HOLIDAYS: Set<string> = new Set([
  // 2025
  '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18',
  '2025-05-01', '2025-05-26', '2025-06-16', '2025-06-23', '2025-06-29',
  '2025-07-20', '2025-08-07', '2025-08-18', '2025-10-13', '2025-11-03',
  '2025-11-17', '2025-12-08', '2025-12-25',
  // 2026
  '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
  '2026-05-01', '2026-06-08', '2026-06-29', '2026-07-06', '2026-07-20',
  '2026-08-07', '2026-08-24', '2026-10-12', '2026-11-02', '2026-11-16',
  '2026-12-08', '2026-12-25',
]);

function toKey(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function esDiaHabil(fecha: Date): boolean {
  return fecha.getDay() < 5 && !COLOMBIAN_HOLIDAYS.has(toKey(fecha));
}

export function diasHabilesEntre(inicio: Date, fin: Date): number {
  let count = 0;
  const actual = new Date(inicio);
  while (actual < fin) {
    if (esDiaHabil(actual)) count++;
    actual.setDate(actual.getDate() + 1);
  }
  return count;
}

export function agregarDiasHabiles(fecha: Date, n: number): Date {
  const resultado = new Date(fecha);
  let agregados = 0;
  while (agregados < n) {
    resultado.setDate(resultado.getDate() + 1);
    if (esDiaHabil(resultado)) agregados++;
  }
  return resultado;
}
