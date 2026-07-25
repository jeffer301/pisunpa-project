import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { Usuario } from '../../models/usuario.model';
import { Rol } from './role.model';
import { environment } from '../../../environments/environment';

const ACCESS_KEY = 'pisunpa_access_token';
const REFRESH_KEY = 'pisunpa_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _usuarioActivo = signal<Usuario | null>(null);

  usuarioActivo = this._usuarioActivo.asReadonly();

  readonly rolActual = computed<Rol | null>(() => this._usuarioActivo()?.rol ?? null);

  tienePermiso(accion: 'leer' | 'escribir'): boolean {
    const rol = this._usuarioActivo()?.rol;
    if (!rol) return false;
    if (accion === 'leer') return true;
    return ['administrador', 'director', 'secretario'].includes(rol);
  }

  tieneRol(...roles: Rol[]): boolean {
    const rol = this._usuarioActivo()?.rol;
    return rol != null && roles.includes(rol);
  }

  constructor() {
    this.restaurarSesion();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{ access: string; refresh: string }>(
      `${environment.apiUrl}/usuarios/login/`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem(ACCESS_KEY, res.access);
        localStorage.setItem(REFRESH_KEY, res.refresh);
      }),
      switchMap(() => this.obtenerPerfil())
    );
  }

  obtenerPerfil(): Observable<boolean> {
    return this.http.get<Usuario>(`${environment.apiUrl}/usuarios/perfil/`).pipe(
      tap(usuario => this._usuarioActivo.set(usuario)),
      switchMap(() => [true])
    );
  }

  get token(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  get estaAutenticado(): boolean {
    return !!this.token && !!this._usuarioActivo();
  }

  cerrarSesion(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this._usuarioActivo.set(null);
  }

  private restaurarSesion(): void {
    const token = localStorage.getItem(ACCESS_KEY);
    if (token) {
      this.obtenerPerfil().subscribe({
        error: () => this.cerrarSesion(),
      });
    }
  }
}
