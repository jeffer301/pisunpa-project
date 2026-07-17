export type Rol = 'administrador' | 'director' | 'secretario' | 'profesor' | 'egresado' | 'estudiante';

export const ROL_LABELS: Record<Rol, string> = {
  administrador: 'Administrador',
  director: 'Director',
  secretario: 'Secretario',
  profesor: 'Profesor',
  egresado: 'Egresado',
  estudiante: 'Estudiante',
};
