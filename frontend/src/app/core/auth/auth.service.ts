import { Injectable, inject, signal } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuariosService = inject(UsuariosService);
  private _usuarioActivo = signal<Usuario>(this.usuariosService.getById(1)!);

  usuarioActivo = this._usuarioActivo.asReadonly();

  tienePermiso(accion: 'leer' | 'escribir'): boolean {
    const rol = this._usuarioActivo().rol;
    if (accion === 'leer') return true;
    return ['administrador', 'director', 'secretario'].includes(rol);
  }

  cambiarUsuario(usuario: Usuario): void {
    this._usuarioActivo.set(usuario);
  }
}
