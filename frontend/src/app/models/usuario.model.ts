import { Rol } from '../core/auth/role.model';

export interface Usuario {
  id: number;
  nombre?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  rol: Rol;
  activo?: boolean;
  documento?: string;
  documento_identidad?: string;
  telefono?: string;
  foto?: string;
  estado?: 'pendiente_aprobacion' | 'aprobado' | 'rechazado';
}
