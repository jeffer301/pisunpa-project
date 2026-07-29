import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Profesor } from '../models/profesor.model';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  listar(): Observable<Profesor[]> {
    return this.http.get<Profesor[]>(`${this.apiUrl}/profesores/`);
  }

  importarExcel(archivo: File): Observable<{ creados: number; duplicados: number; errores: string[]; total_procesados: number }> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<any>(`${this.apiUrl}/profesores/importar/`, formData);
  }

  invitar(id: string): Observable<{ token: string; email: string }> {
    return this.http.post<any>(`${this.apiUrl}/profesores/${id}/invitar/`, {});
  }

  detalleInvitacion(token: string): Observable<{
    email: string;
    first_name: string;
    last_name: string;
    token: string;
    valido: boolean;
  }> {
    return this.http.get<any>(`${this.apiUrl}/invitacion/${token}/`);
  }
}
