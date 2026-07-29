export interface Egresado {
  id: number;
  nombres: string;
  apellidos: string;
  direccion: string;
  edad: number;
  fechaGraduacion: Date;
  idPrograma: number;
  idDepartamento: number;
  idCiudad: number;
  trabajaActualmente: boolean;
  empresa: string;
}
