import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { AuthService } from '../../core/auth/auth.service';
import { ROL_LABELS } from '../../core/auth/role.model';
import { Usuario } from '../../models/usuario.model';
import { UsuarioModalComponent } from './usuario-modal/usuario-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioModalComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .admin-nav {
      display: flex;
      gap: 1.25rem;
      margin: 1rem 0;
    }
    .admin-nav a {
      color: #4a5568;
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.25rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .admin-nav a:hover,
    .admin-nav a.active {
      color: #0a2463;
      border-bottom-color: #3da5d9;
    }
  `],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  rolLabels = ROL_LABELS;

  readonly usuarioSeleccionado = signal<Usuario | null>(null);
  readonly mostrarModal = signal(false);
  readonly modoEdicion = signal(false);
  readonly filtroBusqueda = signal('');
  readonly filtroEstado = signal<'todos' | 'activo' | 'inactivo'>('todos');
  readonly usuarioPendienteEliminacion = signal<Usuario | null>(null);
  readonly usuariosFiltrados = computed(() => this.usuariosService.usuarios().filter((usuario) => {
    const consulta = this.filtroBusqueda().trim().toLocaleLowerCase();
    const coincideConsulta = !consulta || `${usuario.nombre} ${usuario.email}`.toLocaleLowerCase().includes(consulta);
    const coincideEstado = this.filtroEstado() === 'todos' || (this.filtroEstado() === 'activo' ? usuario.activo : !usuario.activo);
    return coincideConsulta && coincideEstado;
  }));
  readonly hayFiltrosActivos = computed(() => Boolean(this.filtroBusqueda().trim() || this.filtroEstado() !== 'todos'));

  get puedeGestionar(): boolean {
    const rol = this.authService.usuarioActivo()?.rol;
    return rol === 'administrador' || rol === 'director';
  }

  abrirCrear(): void {
    this.usuarioSeleccionado.set(null);
    this.modoEdicion.set(false);
    this.mostrarModal.set(true);
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioSeleccionado.set({ ...usuario });
    this.modoEdicion.set(true);
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.usuarioSeleccionado.set(null);
  }

  onGuardar(usuario: Omit<Usuario, 'id'> | Usuario): void {
    if (this.modoEdicion() && 'id' in usuario) {
      this.usuariosService.actualizar(usuario as Usuario);
    } else {
      this.usuariosService.guardar(usuario as Omit<Usuario, 'id'>);
    }
    this.cerrarModal();
    this.feedback.show('Usuario guardado.');
  }

  limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroEstado.set('todos');
  }

  solicitarEliminacion(usuario: Usuario): void {
    this.usuarioPendienteEliminacion.set(usuario);
  }

  cancelarEliminacion(): void {
    this.usuarioPendienteEliminacion.set(null);
  }

  confirmarEliminacion(): void {
    const usuario = this.usuarioPendienteEliminacion();
    if (!usuario) return;
    this.usuariosService.eliminar(usuario.id);
    this.cancelarEliminacion();
    this.feedback.show('Usuario eliminado.');
  }
}
