import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evento, EventoWrite, InscripcionEvento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/egresados/eventos/`;
  private origen = environment.apiUrl.replace(/\/api$/, '');

  listar(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.baseUrl);
  }

  obtener(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}${id}/`);
  }

  crear(evento: EventoWrite, imagen?: File | null): Observable<Evento> {
    const body = imagen ? this.construirFormData(evento, imagen) : evento;
    return this.http.post<Evento>(this.baseUrl, body);
  }

  actualizar(id: string, evento: Partial<EventoWrite>, imagen?: File | null): Observable<Evento> {
    const body = imagen ? this.construirFormData(evento, imagen) : evento;
    return this.http.patch<Evento>(`${this.baseUrl}${id}/`, body);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  inscribirse(id: string): Observable<InscripcionEvento> {
    return this.http.post<InscripcionEvento>(`${this.baseUrl}${id}/inscribirse/`, {});
  }

  cancelarInscripcion(id: string): Observable<{ detail: string }> {
    return this.http.delete<{ detail: string }>(`${this.baseUrl}${id}/inscripcion/`);
  }

  inscritos(id: string): Observable<InscripcionEvento[]> {
    return this.http.get<InscripcionEvento[]>(`${this.baseUrl}${id}/inscritos/`);
  }

  urlImagen(imagen: string | null): string | null {
    if (!imagen) {
      return null;
    }
    return imagen.startsWith('http') ? imagen : `${this.origen}${imagen}`;
  }

  private construirFormData(evento: Partial<EventoWrite>, imagen: File): FormData {
    const form = new FormData();
    Object.entries(evento).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, String(value));
      }
    });
    form.append('imagen', imagen);
    return form;
  }
}
