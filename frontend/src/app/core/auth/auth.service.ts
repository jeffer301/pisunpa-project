import { Injectable, inject, signal, computed } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';
import { Rol } from './role.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuariosService = inject(UsuariosService);
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

  login(email: string, password: string): boolean {
    const usuario = this.usuariosService.usuarios().find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.activo
    );
    if (usuario && password === '123456') {
      this._usuarioActivo.set(usuario);
      return true;
    }
    return false;
  }

  cambiarUsuario(usuario: Usuario): void {
    this._usuarioActivo.set(usuario);
  }

  cerrarSesion(): void {
    this._usuarioActivo.set(null);
  }
}
