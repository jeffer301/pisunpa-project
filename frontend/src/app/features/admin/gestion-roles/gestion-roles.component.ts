import { Component, ChangeDetectionStrategy, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Rol, ROL_LABELS } from '../../../core/auth/role.model';
import { Usuario } from '../../../models/usuario.model';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gestion-roles.component.html',
  styles: [`
    .form-crear {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin: 1rem 0;
      background: #f8fafc;
    }
    .form-crear input,
    .form-crear select {
      padding: 0.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .btn-guardar {
      padding: 0.45rem 1rem;
      border: none;
      border-radius: 6px;
      background: #0a2463;
      color: #fff;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
    }
    .btn-guardar:hover:not(:disabled) {
      background: #163d8f;
    }
    .btn-guardar:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    .motivo {
      color: #a0aec0;
      font-size: 0.8rem;
    }
  `],
})
export class GestionRolesComponent implements OnInit {
  usuariosService = inject(UsuariosService);
  authService = inject(AuthService);
  private feedback = inject(FeedbackService);
  rolLabels = ROL_LABELS;

  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly filtroBusqueda = signal('');
  readonly cambios = signal<Record<string, Rol>>({});
  readonly enviando = signal<Record<string, boolean>>({});
  readonly mostrandoCrear = signal(false);
  readonly creando = signal(false);

  readonly nuevoEmail = signal('');
  readonly nuevoNombre = signal('');
  readonly nuevoApellido = signal('');
  readonly nuevoDocumento = signal('');
  readonly nuevoPassword = signal('');
  readonly nuevoRol = signal<Rol>('coordinador');

  readonly esSuperadmin = this.authService.tieneRol('director');

  readonly rolesAsignables = computed<Rol[]>(() => {
    const todos = Object.keys(ROL_LABELS) as Rol[];
    if (this.esSuperadmin) return todos.filter(r => r !== 'director');
    return todos.filter(r => r !== 'director' && r !== 'administrador');
  });

  readonly usuariosFiltrados = computed(() => {
    const consulta = this.filtroBusqueda().trim().toLocaleLowerCase();
    if (!consulta) return this.usuarios();
    return this.usuarios().filter(u =>
      `${u.nombre ?? ''} ${u.email}`.toLocaleLowerCase().includes(consulta)
    );
  });

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

  filaBloqueada(u: Usuario): boolean {
    if (u.id === this.authService.usuarioActivo()?.id) return true;
    if (!this.esSuperadmin && (u.rol === 'administrador' || u.rol === 'director')) return true;
    return false;
  }

  motivoBloqueo(u: Usuario): string {
    if (u.id === this.authService.usuarioActivo()?.id) {
      return 'No puedes cambiar tu propio rol.';
    }
    return 'Solo el director puede modificar cuentas de administrador o director.';
  }

  rolSeleccionado(u: Usuario): Rol {
    return this.cambios()[u.id] ?? u.rol ?? 'estudiante';
  }

  onRolCambiar(u: Usuario, rol: Rol): void {
    this.cambios.update(m => ({ ...m, [u.id]: rol }));
  }

  hayCambio(u: Usuario): boolean {
    return this.cambios()[u.id] != null && this.cambios()[u.id] !== (u.rol ?? 'estudiante');
  }

  guardarRol(u: Usuario): void {
    const rol = this.cambios()[u.id];
    if (!rol) return;
    this.enviando.update(m => ({ ...m, [u.id]: true }));
    this.usuariosService.cambiarRol(u.id, rol).subscribe({
      next: (actualizado) => {
        this.usuarios.update(lista => lista.map(x => x.id === actualizado.id ? actualizado : x));
        this.limpiarFila(u.id);
        this.feedback.show('Rol actualizado.');
      },
      error: (err) => {
        this.limpiarFila(u.id);
        this.feedback.show(
          err.error?.non_field_errors?.[0] ?? 'Error al cambiar el rol.',
          'error'
        );
      },
    });
  }

  private limpiarFila(id: string): void {
    this.cambios.update(m => {
      const { [id]: _ignorado, ...resto } = m;
      return resto;
    });
    this.enviando.update(m => {
      const { [id]: _ignorado, ...resto } = m;
      return resto;
    });
  }

  crearUsuario(): void {
    const email = this.nuevoEmail().trim();
    const nombre = this.nuevoNombre().trim();
    const password = this.nuevoPassword();
    if (!email || !nombre || password.length < 8) {
      this.feedback.show(
        'Completa email, nombre y una contraseña de al menos 8 caracteres.',
        'error'
      );
      return;
    }
    this.creando.set(true);
    this.usuariosService.crearAdmin({
      email,
      first_name: nombre,
      last_name: this.nuevoApellido().trim(),
      documento: this.nuevoDocumento().trim(),
      password,
      rol: this.nuevoRol(),
    }).subscribe({
      next: (creado) => {
        this.usuarios.update(lista => [...lista, creado]);
        this.creando.set(false);
        this.mostrandoCrear.set(false);
        this.nuevoEmail.set('');
        this.nuevoNombre.set('');
        this.nuevoApellido.set('');
        this.nuevoDocumento.set('');
        this.nuevoPassword.set('');
        this.nuevoRol.set('coordinador');
        this.feedback.show('Usuario creado.');
      },
      error: (err) => {
        this.creando.set(false);
        const msg = err.error?.email?.[0]
          ?? err.error?.documento?.[0]
          ?? err.error?.non_field_errors?.[0]
          ?? 'Error al crear el usuario.';
        this.feedback.show(msg, 'error');
      },
    });
  }
}
