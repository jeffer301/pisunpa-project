export interface Profesor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nombre?: string;
  estado: string;
  invitacion_enviada: boolean;
  invitacion_usada: boolean;
  creado: string;
}
