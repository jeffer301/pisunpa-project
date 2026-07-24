import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, UsuarioModalComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  rolLabels = ROL_LABELS;

  readonly usuarios = signal<Usuario[]>([]);
  readonly usuarioSeleccionado = signal<Usuario | null>(null);
  readonly mostrarModal = signal(false);
  readonly modoEdicion = signal(false);
  readonly filtroBusqueda = signal('');
  readonly filtroEstado = signal<'todos' | 'activo' | 'inactivo'>('todos');
  readonly usuarioPendienteEliminacion = signal<Usuario | null>(null);
  readonly usuariosFiltrados = computed(() => this.usuarios().filter((usuario) => {
    const consulta = this.filtroBusqueda().trim().toLocaleLowerCase();
    const nombreCompleto = `${usuario.first_name} ${usuario.last_name}`.toLocaleLowerCase();
    const coincideConsulta = !consulta || nombreCompleto.includes(consulta) || usuario.email.toLocaleLowerCase().includes(consulta);
    return coincideConsulta;
  }));
  readonly hayFiltrosActivos = computed(() => Boolean(this.filtroBusqueda().trim() || this.filtroEstado() !== 'todos'));

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios) => this.usuarios.set(usuarios),
      error: () => this.feedback.show('Error al cargar usuarios.')
    });
  }

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

  onGuardar(usuario: Partial<Usuario> & { password?: string; password2?: string }): void {
    if (this.modoEdicion() && 'id' in usuario) {
      this.usuariosService.actualizar(usuario as Usuario).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
          this.feedback.show('Usuario actualizado.');
        },
        error: () => this.feedback.show('Error al actualizar usuario.')
      });
    } else {
      this.usuariosService.guardar(usuario as any).subscribe({
        next: () => {
          this.cargarUsuarios();
          this.cerrarModal();
          this.feedback.show('Usuario creado.');
        },
        error: () => this.feedback.show('Error al crear usuario.')
      });
    }
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
    this.usuariosService.eliminar(usuario.id).subscribe({
      next: () => {
        this.cargarUsuarios();
        this.cancelarEliminacion();
        this.feedback.show('Usuario eliminado.');
      },
      error: () => this.feedback.show('Error al eliminar usuario.')
    });
  }
}
