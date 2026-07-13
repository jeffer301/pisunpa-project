import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../core/auth/auth.service';
import { ROL_LABELS } from '../../core/auth/role.model';
import { Usuario } from '../../models/usuario.model';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, UsuarioModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  rolLabels = ROL_LABELS;

  usuarioSeleccionado: Usuario | null = null;
  mostrarModal = false;
  modoEdicion = false;

  get puedeGestionar(): boolean {
    const rol = this.authService.usuarioActivo().rol;
    return rol === 'administrador' || rol === 'director';
  }

  abrirCrear(): void {
    this.usuarioSeleccionado = null;
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioSeleccionado = { ...usuario };
    this.modoEdicion = true;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
  }

  onGuardar(usuario: Omit<Usuario, 'id'> | Usuario): void {
    if (this.modoEdicion && 'id' in usuario) {
      this.usuariosService.actualizar(usuario as Usuario);
    } else {
      this.usuariosService.guardar(usuario as Omit<Usuario, 'id'>);
    }
    this.cerrarModal();
  }

  eliminar(id: number): void {
    this.usuariosService.eliminar(id);
  }
}
