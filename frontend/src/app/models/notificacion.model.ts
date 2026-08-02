export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'solicitud_creada' | 'solicitud_aprobada' | 'solicitud_rechazada'
    | 'pago_confirmado' | 'examen_agendado' | 'examen_calificado'
    | 'evento_creado' | 'evento_inscripcion' | 'evento_cancelacion';
  leido: boolean;
  supletorio_id?: string;
  evento_id?: string;
  creado_en: string;
}
