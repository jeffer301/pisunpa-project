export type EstadoSupletorio =
  | 'pendiente'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada'
  | 'formato_pendiente'
  | 'comprobante_subido'
  | 'notificado_profesor'
  | 'realizado';

export interface SolicitudSupletorio {
  id: string;
  estudiante: string;
  email: string;
  programa: string;
  asignatura: string;
  profesor: string;
  grupo: string;
  descripcion: string;
  fechaParcial: string;
  estadoSolicitud: 'pendiente' | 'aprobada' | 'rechazada';
  estadoPago: 'pendiente' | 'comprobante_subido' | 'pagado';
  comprobanteNombre: string | null;
}

export interface MiSolicitudSupletorio {
  id: string;
  asignatura: string;
  profesor: string;
  grupo: string;
  programa: string;
  fechaParcial: string;
  fechaSolicitud: string;
  estado: EstadoSupletorio;
  comprobanteNombre: string | null;
}
