import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Egresado } from '../models/egresado.model';
import { Programa } from '../models/programa.model';
import { Departamento } from '../models/departamento.model';
import { Ciudad } from '../models/ciudad.model';

@Injectable({ providedIn: 'root' })
export class EgresadosService {

  private departamentos: Departamento[] = [
    { id: 1, nombre: 'Valle del Cauca' },
    { id: 2, nombre: 'Cauca' },
    { id: 3, nombre: 'Nariño' },
    { id: 4, nombre: 'Bolívar' },
    { id: 5, nombre: 'Antioquia' },
  ];

  private ciudades: Ciudad[] = [
    { id: 1, nombre: 'Cali', idDepartamento: 1 },
    { id: 2, nombre: 'Buenaventura', idDepartamento: 1 },
    { id: 3, nombre: 'Palmira', idDepartamento: 1 },
    { id: 4, nombre: 'Popayán', idDepartamento: 2 },
    { id: 5, nombre: 'Pasto', idDepartamento: 3 },
    { id: 6, nombre: 'Cartagena', idDepartamento: 4 },
    { id: 7, nombre: 'Medellín', idDepartamento: 5 },
  ];

  private programas: Programa[] = [
    { id: 1, nombre: 'Ingeniería de Sistemas' },
    { id: 2, nombre: 'Ingeniería Civil' },
    { id: 3, nombre: 'Derecho' },
    { id: 4, nombre: 'Medicina' },
    { id: 5, nombre: 'Administración de Empresas' },
  ];

  private egresados: Egresado[] = [
    {
      id: 1, nombres: 'Juan', apellidos: 'Pérez López',
      direccion: 'Cra 10 #5-20', edad: 28, fechaGraduacion: new Date('2022-06-15'),
      idPrograma: 1, idDepartamento: 1, idCiudad: 1,
      trabajaActualmente: true, empresa: 'TechSoft'
    },
    {
      id: 2, nombres: 'María', apellidos: 'García Ruiz',
      direccion: 'Calle 8 #3-12', edad: 32, fechaGraduacion: new Date('2020-11-20'),
      idPrograma: 3, idDepartamento: 5, idCiudad: 7,
      trabajaActualmente: true, empresa: 'Bufé Legal MG'
    },
    {
      id: 3, nombres: 'Carlos', apellidos: 'López Martínez',
      direccion: 'Av 6N #45-10', edad: 35, fechaGraduacion: new Date('2018-03-10'),
      idPrograma: 2, idDepartamento: 2, idCiudad: 4,
      trabajaActualmente: false, empresa: ''
    },
  ];

  private nextId = 4;

  getDepartamentos(): Observable<Departamento[]> {
    return of(this.departamentos);
  }

  getCiudades(): Observable<Ciudad[]> {
    return of(this.ciudades);
  }

  getCiudadesByDepartamento(idDepartamento: number): Observable<Ciudad[]> {
    const filtradas = this.ciudades.filter(c => c.idDepartamento === idDepartamento);
    return of(filtradas);
  }

  getProgramas(): Observable<Programa[]> {
    return of(this.programas);
  }

  getEgresados(): Observable<Egresado[]> {
    return of(this.egresados);
  }

  getEgresadoById(id: number): Observable<Egresado | undefined> {
    return of(this.egresados.find(e => e.id === id));
  }

  guardarEgresado(egresado: Omit<Egresado, 'id'>): Observable<Egresado> {
    const nuevo: Egresado = { ...egresado, id: this.nextId++ };
    this.egresados.push(nuevo);
    return of(nuevo);
  }

  actualizarEgresado(egresado: Egresado): Observable<Egresado> {
    const idx = this.egresados.findIndex(e => e.id === egresado.id);
    if (idx >= 0) this.egresados[idx] = egresado;
    return of(egresado);
  }

  eliminarEgresado(id: number): Observable<boolean> {
    const idx = this.egresados.findIndex(e => e.id === id);
    if (idx >= 0) this.egresados.splice(idx, 1);
    return of(idx >= 0);
  }
}
