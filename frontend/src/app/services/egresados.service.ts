import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Egresado } from '../models/egresado.model';
import { Programa } from '../models/programa.model';
import { Departamento } from '../models/departamento.model';
import { Ciudad } from '../models/ciudad.model';

@Injectable({ providedIn: 'root' })
export class EgresadosService {

  private http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api/egresados';

  // --- Egresados: sigue en mock, sin tocar ---
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

  // --- Catálogos: ahora conectados al backend real ---

  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/departamentos/`);
  }

  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/ciudades/`);
  }

  getCiudadesByDepartamento(idDepartamento: number): Observable<Ciudad[]> {
    const params = new HttpParams().set('idDepartamento', idDepartamento);
    return this.http.get<Ciudad[]>(`${this.apiUrl}/ciudades/`, { params });
  }

  getProgramas(): Observable<Programa[]> {
    return this.http.get<Programa[]>(`${this.apiUrl}/programas/`);
  }

  // --- Egresados: sin tocar, sigue en memoria ---

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