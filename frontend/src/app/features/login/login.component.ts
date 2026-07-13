import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';
import { ROL_LABELS, Rol } from '../../core/auth/role.model';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a2463 0%, #163d8f 50%, #3da5d9 100%);
    }

    .login-container {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      padding: 3rem 2.5rem;
      max-width: 520px;
      width: 90%;
      text-align: center;
    }

    .login-brand {
      font-size: 2rem;
      font-weight: 700;
      color: #0a2463;
      margin-bottom: 0.25rem;
    }

    .login-subtitle {
      color: #718096;
      font-size: 0.95rem;
      margin-bottom: 2rem;
    }

    .login-section-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #a0aec0;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .user-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: left;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #fff;
    }

    .user-card:hover {
      border-color: #3da5d9;
      box-shadow: 0 2px 8px rgba(61, 165, 217, 0.15);
      transform: translateY(-1px);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e8eeff;
      color: #0a2463;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #1a202c;
      font-size: 0.9rem;
    }

    .user-email {
      color: #a0aec0;
      font-size: 0.8rem;
    }

    .rol-tag {
      background: #e8eeff;
      color: #0a2463;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .rol-tag.lectura {
      background: #fff3cd;
      color: #856404;
    }
  `],
  template: `
    <div class="login-container">
      <div class="login-brand">pisunpa.com</div>
      <p class="login-subtitle">Sistema de Gestión de Egresados</p>

      <p class="login-section-title">Selecciona un usuario para continuar</p>

      <div class="user-cards">
        @for (u of usuarios(); track u.id) {
          <button class="user-card" (click)="seleccionar(u)">
            <div class="user-avatar">{{ u.nombre.charAt(0) }}</div>
            <div class="user-details">
              <div class="user-name">{{ u.nombre }}</div>
              <div class="user-email">{{ u.email }}</div>
            </div>
            <span class="rol-tag" [class.lectura]="esLectura(u.rol)">
              {{ rolLabels[u.rol] }}
            </span>
          </button>
        }
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);

  usuarios = this.usuariosService.usuarios;
  rolLabels = ROL_LABELS;

  esLectura(rol: Rol): boolean {
    return rol === 'profesor' || rol === 'egresado';
  }

  seleccionar(usuario: Usuario): void {
    this.authService.cambiarUsuario(usuario);
    this.router.navigate(['/dashboard']);
  }
}
