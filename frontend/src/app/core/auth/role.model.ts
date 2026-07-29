export type Rol = 'administrador' | 'director' | 'secretario' | 'profesor' | 'egresado' | 'estudiante';

const ROL_ALIASES: Record<string, Rol> = {
  admin: 'administrador',
  administrador: 'administrador',
  director: 'director',
  secretario: 'secretario',
  profesor: 'profesor',
  docente: 'profesor',
  egresado: 'egresado',
  estudiante: 'estudiante',
  student: 'estudiante',
};

export function normalizeRol(raw: string | null | undefined): Rol | null {
  if (!raw) return null;
  return ROL_ALIASES[raw.toLowerCase()] ?? null;
}

export const ROL_LABELS: Record<Rol, string> = {
  administrador: 'Administrador',
  director: 'Director',
  secretario: 'Secretario',
  profesor: 'Profesor',
  egresado: 'Egresado',
  estudiante: 'Estudiante',
};
