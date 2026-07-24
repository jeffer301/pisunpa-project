export interface Egresado {
  id: string;
  usuario?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  tipo_documento: string;
  numero_documento: string;
  fecha_nacimiento: string | null;
  telefono_celular: string;
  direccion_residencia: string;
  biografia: string;
  trabaja_actualmente: boolean;
  programa: {
    id: string;
    nombre: string;
  } | null;
  departamento: {
    id: string;
    nombre: string;
  } | null;
  ciudad: {
    id: string;
    nombre: string;
  } | null;
  contacto_emergencia_nombre: string;
  contacto_emergencia_parentesco: string;
  contacto_emergencia_telefono: string;
  contacto_emergencia_email: string;
  experiencias: ExperienciaLaboral[];
  estudios: EstudioPosterior[];
  redes: RedProfesional[];
  documentos: DocumentoAdjunto[];
  validado: boolean;
}

export interface ExperienciaLaboral {
  id: string;
  empresa: string;
  nit: string;
  sector_economico: string;
  cargo: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  cargo_actual: boolean;
  modalidad: string;
  tipo_contrato: string;
  rango_salarial: string;
}

export interface EstudioPosterior {
  id: string;
  nivel_estudio: string;
  institucion: string;
  titulo: string;
  pais: string;
  estado: string;
  fecha_graduacion: string | null;
  anio_finalizacion: number | null;
}

export interface RedProfesional {
  id: string;
  plataforma: string;
  url: string;
  visibilidad: string;
}

export interface DocumentoAdjunto {
  id: string;
  nombre: string;
  archivo: string;
  tipo_documento: string;
  tamano: string;
  fecha_carga: string;
}
