import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudSupletorio } from '../features/admin/bandeja-supletorios/bandeja-supletorios.component';
import { environment } from '../../environments/environment';

export interface SupletorioPendiente {
  id: string;
  estudiante: string;
  programa: string;
  asignatura: string;
  grupo: string;
  fechaParcial: string;
  estado: 'listo' | 'realizado';
}

@Injectable({ providedIn: 'root' })
export class SupletorioService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/supletorios`;

  // --- Estudiante ---
  crearSolicitud(datos: {
    fechaParcial: string;
    profesor: string;
    asignatura: string;
    grupoAsignatura: string;
    idPrograma: string;
    descripcion: string;
    anexos: File[];
  }): Observable<SolicitudSupletorio> {
    const formData = new FormData();
    formData.append('fechaParcial', datos.fechaParcial);
    formData.append('profesor', datos.profesor);
    formData.append('asignatura', datos.asignatura);
    formData.append('grupoAsignatura', datos.grupoAsignatura);
    formData.append('idPrograma', String(datos.idPrograma));
    formData.append('descripcion', datos.descripcion);
    datos.anexos.forEach(archivo => formData.append('anexos', archivo));

    return this.http.post<SolicitudSupletorio>(`${this.apiUrl}/solicitudes/`, formData);
  }

  subirComprobante(archivo: File): Observable<{ detail: string }> {
    const formData = new FormData();
    formData.append('comprobante', archivo);
    return this.http.post<{ detail: string }>(`${this.apiUrl}/pago/comprobante/`, formData);
  }

  // --- Admin ---
  getBandeja(): Observable<SolicitudSupletorio[]> {
    return this.http.get<SolicitudSupletorio[]>(`${this.apiUrl}/bandeja/`);
  }

  aprobar(id: string): Observable<SolicitudSupletorio> {
    return this.http.post<SolicitudSupletorio>(`${this.apiUrl}/bandeja/${id}/aprobar/`, {});
  }

  rechazar(id: string): Observable<SolicitudSupletorio> {
    return this.http.post<SolicitudSupletorio>(`${this.apiUrl}/bandeja/${id}/rechazar/`, {});
  }

  confirmarPago(id: string): Observable<SolicitudSupletorio> {
    return this.http.post<SolicitudSupletorio>(`${this.apiUrl}/bandeja/${id}/confirmar-pago/`, {});
  }

  // --- Profesor ---
  getPendientes(): Observable<SupletorioPendiente[]> {
    return this.http.get<SupletorioPendiente[]>(`${this.apiUrl}/pendientes/`);
  }

  marcarRealizado(id: string): Observable<SupletorioPendiente> {
    return this.http.post<SupletorioPendiente>(`${this.apiUrl}/pendientes/${id}/realizado/`, {});
  }
}
