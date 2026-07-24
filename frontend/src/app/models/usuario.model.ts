import { Rol } from '../core/auth/role.model';

export interface Usuario {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  documento: string;
  telefono: string;
  foto: string | null;
  rol: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegistroRequest {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  documento: string;
  telefono: string;
  password: string;
  password2: string;
}
