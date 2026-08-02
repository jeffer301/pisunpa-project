import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit } from '@angular/core';
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
export class AdminComponent implements OnInit {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  rolLabels = ROL_LABELS;

  readonly usuarioSeleccionado = signal<Usuario | null>(null);
  readonly mostrarModal = signal(false);
  readonly modoEdicion = signal(false);
  readonly filtroBusqueda = signal('');
  readonly filtroEstado = signal<'todos' | 'aprobado' | 'pendiente_aprobacion' | 'rechazado'>('todos');
  readonly usuarioPendienteEliminacion = signal<Usuario | null>(null);
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);

  readonly usuariosFiltrados = computed(() => {
    const consulta = this.filtroBusqueda().trim().toLocaleLowerCase();
    return this.usuarios().filter(usuario => {
      const coincideConsulta = !consulta ||
        `${usuario.nombre ?? ''} ${usuario.email}`.toLocaleLowerCase().includes(consulta);
      const coincideEstado = this.filtroEstado() === 'todos' || usuario.estado === this.filtroEstado();
      return coincideConsulta && coincideEstado;
    });
  });
  readonly hayFiltrosActivos = computed(() =>
    Boolean(this.filtroBusqueda().trim() || this.filtroEstado() !== 'todos')
  );

  get puedeGestionar(): boolean {
    return this.authService.esAdminEscritura();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.feedback.show('Error al cargar los usuarios.', 'error');
      },
    });
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
      const edit = usuario as Usuario;
      this.usuariosService.cambiarRol(edit.id, edit.rol).subscribe({
        next: (actualizado) => {
          this.usuarios.update(lista => lista.map(u => u.id === actualizado.id ? actualizado : u));
          this.cerrarModal();
          this.feedback.show('Rol actualizado.');
        },
        error: (err) => this.feedback.show(err.error?.non_field_errors?.[0] ?? 'Error al cambiar el rol.', 'error'),
      });
    } else {
      const nuevo = usuario as Omit<Usuario, 'id'> & { password?: string; first_name?: string; last_name?: string };
      this.usuariosService.crearAdmin({
        email: nuevo.email,
        first_name: nuevo.first_name ?? nuevo.nombre?.split(' ')[0] ?? '',
        last_name: nuevo.last_name ?? (nuevo.nombre?.split(' ').slice(1).join(' ') ?? ''),
        documento: nuevo.documento ?? '',
        password: nuevo.password ?? 'cambiar123',
        rol: nuevo.rol,
      }).subscribe({
        next: (creado) => {
          this.usuarios.update(lista => [...lista, creado]);
          this.cerrarModal();
          this.feedback.show('Usuario creado.');
        },
        error: (err) => this.feedback.show(err.error?.email?.[0] ?? err.error?.documento?.[0] ?? 'Error al crear el usuario.', 'error'),
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
    this.feedback.show('La eliminación de usuarios no está disponible; usa el cambio de rol.', 'error');
    this.cancelarEliminacion();
  }
}
