export interface Evento {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  lugar: string;
  capacidad: number | null;
  imagen: string | null;
  inscrito: boolean;
  cupos_disponibles: number | null;
  creado_en: string;
}

export interface InscripcionEvento {
  id: string;
  evento: string;
  egresado: string;
  nombre_egresado: string;
  documento_egresado: string;
  programa_egresado: string;
  fecha_inscripcion: string;
}

export interface EventoWrite {
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string | null;
  lugar: string;
  capacidad: number | null;
}
