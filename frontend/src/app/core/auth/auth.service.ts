import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { Usuario, LoginRequest, LoginResponse } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private _usuarioActivo = signal<Usuario | null>(null);
  private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private _refreshToken = signal<string | null>(localStorage.getItem('refresh_token'));

  usuarioActivo = this._usuarioActivo.asReadonly();
  accessToken = this._accessToken.asReadonly();
  refreshToken = this._refreshToken.asReadonly();

  readonly rolActual = computed<string | null>(() => {
    const usuario = this._usuarioActivo();
    return usuario?.rol ?? null;
  });

  tienePermiso(accion: 'leer' | 'escribir'): boolean {
    const rol = this._usuarioActivo()?.rol;
    if (!rol) return false;
    if (accion === 'leer') return true;
    return ['administrador', 'director', 'secretario'].includes(rol);
  }

  tieneRol(...roles: string[]): boolean {
    const rol = this._usuarioActivo()?.rol;
    return rol != null && roles.includes(rol);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/login/`, { email, password }).pipe(
      tap(response => {
        this._accessToken.set(response.access);
        this._refreshToken.set(response.refresh);
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      })
    );
  }

  cargarPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/perfil/`).pipe(
      tap(usuario => this._usuarioActivo.set(usuario))
    );
  }

  refreshAccessToken(): Observable<{ access: string }> | null {
    const refresh = this._refreshToken();
    if (!refresh) return null;

    return this.http.post<{ access: string }>(`${this.apiUrl}/usuarios/refresh/`, { refresh }).pipe(
      tap(response => {
        this._accessToken.set(response.access);
        localStorage.setItem('access_token', response.access);
      }),
      catchError(() => {
        this.cerrarSesion();
        return of({ access: '' });
      })
    );
  }

  cerrarSesion(): void {
    this._usuarioActivo.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  estaAutenticado(): boolean {
    return !!this._accessToken();
  }
}
