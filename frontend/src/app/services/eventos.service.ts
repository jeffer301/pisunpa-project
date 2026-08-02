import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evento, EventoWrite, InscripcionEvento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/egresados/eventos`;

  listar(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.baseUrl);
  }

  obtener(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}/${id}/`);
  }

  crear(evento: EventoWrite): Observable<Evento> {
    return this.http.post<Evento>(this.baseUrl, evento);
  }

  actualizar(id: string, evento: Partial<EventoWrite>): Observable<Evento> {
    return this.http.patch<Evento>(`${this.baseUrl}/${id}/`, evento);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  inscribirse(id: string): Observable<InscripcionEvento> {
    return this.http.post<InscripcionEvento>(`${this.baseUrl}/${id}/inscribirse/`, {});
  }

  cancelarInscripcion(id: string): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.baseUrl}/${id}/inscripcion/`);
  }

  inscritos(id: string): Observable<InscripcionEvento[]> {
    return this.http.get<InscripcionEvento[]>(`${this.baseUrl}/${id}/inscritos/`);
  }
}
