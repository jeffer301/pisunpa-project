import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
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
      max-width: 420px;
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
      margin-bottom: 0.5rem;
    }

    .login-slogan {
      font-size: 0.82rem;
      font-style: italic;
      color: #5a8db5;
      margin-bottom: 1.75rem;
    }

    .form-group {
      text-align: left;
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.35rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.7rem 0.9rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #1a202c;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 3px rgba(61, 165, 217, 0.15);
    }

    .form-group input.invalid {
      border-color: #e53e3e;
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }

    .field-error {
      color: #e53e3e;
      font-size: 0.8rem;
      margin-top: 0.3rem;
    }

    .login-error {
      background: #fff5f5;
      color: #e53e3e;
      border: 1px solid #fed7d7;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      text-align: left;
    }

    .aviso-advertencia {
      background: #fff3cd;
      color: #856404;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      border: 1px solid #ffc107;
    }

    .btn-login {
      width: 100%;
      padding: 0.75rem;
      background: #0a2463;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-login:hover {
      background: #163d8f;
    }

    .btn-login:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .login-links {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .forgot-link {
      font-size: 0.85rem;
      color: #3da5d9;
      text-decoration: none;
      transition: color 0.2s;
    }

    .forgot-link:hover {
      color: #0a2463;
      text-decoration: underline;
    }

    .login-divider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0.25rem 0;
    }

    .login-divider::before,
    .login-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .login-divider span {
      font-size: 0.8rem;
      color: #a0aec0;
      white-space: nowrap;
    }

    .register-btn {
      display: inline-block;
      padding: 0.65rem 1rem;
      background: transparent;
      color: #0a2463;
      border: 2px solid #0a2463;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }

    .register-btn:hover {
      background: #0a2463;
      color: #fff;
    }
  `],
  template: `
    <div class="login-container">
      <div class="login-brand">pisunpa.com</div>
      <p class="login-subtitle">Sistema de Gestión de Egresados</p>
      <p class="login-slogan">Innovar no es una opción, es nuestro próximo paso. ¡Construyamos juntos el futuro!</p>

      @if (errorMensaje()) {
        <div class="login-error">{{ errorMensaje() }}</div>
      }

      @if (mensajeAdvertencia()) {
        <div class="aviso-advertencia">
          {{ mensajeAdvertencia() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tu@pisunpa.com"
            [(ngModel)]="email"
            name="email"
            required
            email
            #emailField="ngModel"
            [class.invalid]="emailField.invalid && emailField.touched"
          />
          @if (emailField.invalid && emailField.touched) {
            <div class="field-error">
              @if (emailField.errors?.['required']) {
                El correo es obligatorio.
              } @else if (emailField.errors?.['email']) {
                Ingrese un correo válido.
              }
            </div>
          }
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••"
            [(ngModel)]="password"
            name="password"
            required
            minlength="6"
            #passwordField="ngModel"
            [class.invalid]="passwordField.invalid && passwordField.touched"
          />
          @if (passwordField.invalid && passwordField.touched) {
            <div class="field-error">
              @if (passwordField.errors?.['required']) {
                La contraseña es obligatoria.
              } @else if (passwordField.errors?.['minlength']) {
                Mínimo 6 caracteres.
              }
            </div>
          }
        </div>

        <button
          type="submit"
          class="btn-login"
          [disabled]="loginForm.invalid || cargando()"
        >
          {{ cargando() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="login-links">
        <a class="forgot-link" routerLink="/login">¿Olvidaste tu contraseña?</a>

        <div class="login-divider">
          <span>o</span>
        </div>

        <a class="register-btn" routerLink="/registro-egresado">
          ¿Eres egresado antiguo y no tienes cuenta? Regístrate aquí
        </a>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  errorMensaje = signal('');
  mensajeAdvertencia = signal('');
  cargando = signal(false);

  onSubmit(): void {
    this.errorMensaje.set('');
    this.mensajeAdvertencia.set('');

    if (!this.email || !this.password) {
      this.errorMensaje.set('Complete todos los campos.');
      return;
    }

    this.cargando.set(true);
    this.authService.login(this.email, this.password).pipe(
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: (exito) => {
        if (exito) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMensaje.set('Credenciales incorrectas. Inténtalo de nuevo.');
        }
      },
      error: (err) => {
        if (err.status === 403 || (err.error && typeof err.error === 'string')) {
          this.mensajeAdvertencia.set(err.error || 'Acceso denegado');
        } else {
          this.errorMensaje.set('Credenciales incorrectas. Inténtalo de nuevo.');
        }
      },
    });
  }
}
