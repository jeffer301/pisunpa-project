import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Rol } from '../core/auth/role.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  listar(q?: string, estado?: string): Observable<Usuario[]> {
    const params: string[] = [];
    if (q) params.push(`q=${encodeURIComponent(q)}`);
    if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
    const suffix = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/${suffix}`).pipe(
      map(list => list.map(u => this.normalizar(u)))
    );
  }

  cambiarRol(id: string, rol: Rol): Observable<Usuario> {
    return this.http.patch<any>(`${this.apiUrl}/usuarios/${id}/rol/`, { rol })
      .pipe(map(u => this.normalizar(u)));
  }

  crearAdmin(payload: {
    email: string;
    first_name: string;
    last_name: string;
    documento: string;
    password: string;
    rol: Rol;
  }): Observable<Usuario> {
    return this.http.post<any>(`${this.apiUrl}/usuarios/crear-admin/`, payload)
      .pipe(map(u => this.normalizar(u)));
  }

  private normalizar(u: any): Usuario {
    return {
      ...u,
      nombre: u.nombre ?? [u.first_name, u.last_name].filter(Boolean).join(' '),
      rol: u.rol ?? 'estudiante',
    } as Usuario;
  }
}
