import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Egresado } from '../models/egresado.model';
import { Programa } from '../models/programa.model';
import { Departamento } from '../models/departamento.model';
import { Ciudad } from '../models/ciudad.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EgresadosService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // --- Catálogos (públicos) ---
  getDepartamentos(): Observable<Departamento[]> {
    return this.http.get<Departamento[]>(`${this.apiUrl}/egresados/departamentos/`);
  }

  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/egresados/ciudades/`);
  }

  getCiudadesByDepartamento(idDepartamento: string): Observable<Ciudad[]> {
    const params = new HttpParams().set('idDepartamento', idDepartamento);
    return this.http.get<Ciudad[]>(`${this.apiUrl}/egresados/ciudades/`, { params });
  }

  getProgramas(): Observable<Programa[]> {
    return this.http.get<Programa[]>(`${this.apiUrl}/egresados/programas/`);
  }

  // --- Egresados (perfiles) ---
  getEgresados(): Observable<Egresado[]> {
    return this.http.get<Egresado[]>(`${this.apiUrl}/egresados/perfilegresado/`);
  }

  getEgresadoById(id: string): Observable<Egresado> {
    return this.http.get<Egresado>(`${this.apiUrl}/egresados/perfilegresado/${id}/`);
  }

  getMiPerfil(): Observable<Egresado> {
    return this.http.get<Egresado>(`${this.apiUrl}/egresados/perfilegresado/mi_perfil/`);
  }

  guardarEgresado(egresado: Partial<Egresado>): Observable<Egresado> {
    return this.http.post<Egresado>(`${this.apiUrl}/egresados/perfilegresado/`, egresado);
  }

  actualizarEgresado(id: string, egresado: Partial<Egresado>): Observable<Egresado> {
    return this.http.put<Egresado>(`${this.apiUrl}/egresados/perfilegresado/${id}/`, egresado);
  }

  eliminarEgresado(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/egresados/perfilegresado/${id}/`);
  }

  validarEgresado(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/egresados/perfilegresado/${id}/validar/`, {});
  }

  getUsuariosDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/disponibles/`);
  }
}
