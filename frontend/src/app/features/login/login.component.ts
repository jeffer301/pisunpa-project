import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ===== BACKGROUND IMAGE & OVERLAY ===== */
    .bg-image {
      position: fixed;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
    }

    .bg-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ===== MAIN LAYOUT CONTAINER ===== */
    .main-layout {
      position: relative;
      z-index: 2;
      display: flex;
      width: 100%;
      height: 100vh;
      max-width: 100%;
      margin: 0 auto;
      padding: 1.5rem 2rem 1.5rem 0;
      align-items: center;
      justify-content: flex-start;
      gap: 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* ===== LEFT SECTION ===== */
    .left-section {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      max-height: 88vh;
      max-width: 450px;
      color: #ffffff;
      box-sizing: border-box;
    }

    .university-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .university-logo-img {
      height: 50px;
      width: auto;
      object-fit: contain;
    }

    .university-text h2 {
      color: #ffffff;
      font-size: 1.05rem;
      font-weight: 800;
      line-height: 1.15;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .university-text p {
      color: #4ade80;
      font-size: 0.68rem;
      font-weight: 600;
      margin-top: 2px;
    }

    .green-accent-line {
      display: none;
    }

    .brand-content {
      margin: 0.25rem 0;
    }

    .brand-title {
      font-size: 3.1rem;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.05em;
      line-height: 1;
      margin-bottom: 1rem;
    }

    .brand-subtitle {
      font-size: 1.1rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 1rem;
    }

    .brand-slogan {
      font-size: 0.78rem;
      font-style: italic;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.4;
      margin-bottom: 1.5rem;
    }

    /* Features List */
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-top: 0.75rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.45rem 0.75rem;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .feature-icon-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.12);
    }

    .feature-icon-badge svg {
      width: 16px;
      height: 16px;
      color: #4ade80;
    }

    .feature-info h4 {
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 1px;
    }

    .feature-info p {
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.68rem;
      margin: 0;
    }

    /* Footer Left */
    .left-footer {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.68rem;
    }

    /* ===== RIGHT SECTION - SINGLE FLOATING WHITE FORM CARD ===== */
    .right-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 440px;
      flex-shrink: 0;
      margin-left: 8rem;
      background: #ffffff;
      border-radius: 12px;
      padding: 2.25rem 2.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      box-sizing: border-box;
    }

    /* Card Header */
    .card-lock-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .card-lock-badge svg {
      width: 20px;
      height: 20px;
      color: #1e40af;
      stroke-width: 1.5;
    }

    .card-domain {
      text-align: center;
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }

    .card-subtext {
      text-align: center;
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .card-quote {
      text-align: center;
      font-size: 0.75rem;
      font-style: italic;
      color: #3b82f6;
      line-height: 1.4;
      margin-bottom: 1.5rem;
      padding: 0 1rem;
    }

    /* Form Fields */
    .login-form {
      width: 100%;
    }

    .form-field {
      margin-bottom: 1.25rem;
      width: 100%;
    }

    .form-field label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .input-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .input-box .field-icon {
      position: absolute;
      left: 14px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
      pointer-events: none;
    }

    .input-box input {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 2.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #ffffff;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input-box input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .input-box input.invalid {
      border-color: #ef4444;
    }

    .input-box input::placeholder {
      color: #94a3b8;
    }

    .pw-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      padding: 3px;
      display: flex;
      align-items: center;
    }

    .pw-toggle-btn:hover {
      color: #475569;
    }

    .pw-toggle-btn svg {
      width: 18px;
      height: 18px;
    }

    .field-err-msg {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.3rem;
      font-weight: 500;
    }

    .form-error-alert {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      width: 100%;
      text-align: center;
      box-sizing: border-box;
    }

    /* Green Gradient Login Button */
    .submit-btn {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(90deg, #0f172a 0%, #15803d 100%);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
      transition: all 0.3s ease;
      margin-top: 0.5rem;
    }

    .submit-btn:hover {
      background: linear-gradient(90deg, #1e293b 0%, #166534 100%);
      box-shadow: 0 6px 16px rgba(21, 128, 61, 0.35);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Links inside Card */
    .forgot-link {
      display: block;
      text-align: center;
      margin-top: 1.25rem;
      font-size: 0.85rem;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      width: 100%;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .or-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      margin: 1.25rem 0;
      position: relative;
    }

    .or-divider::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 1px;
      background: #f1f5f9;
      z-index: 1;
    }

    .or-circle {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      position: relative;
      z-index: 2;
    }

    /* Registration Card/Button */
    .register-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      padding: 1rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.2s, background 0.2s;
    }

    .register-box:hover {
      background: #f8fafc;
    }

    .register-box-content {
      font-size: 0.8rem;
      color: #334155;
      font-weight: 500;
      line-height: 1.4;
      text-align: center;
    }

    .register-box-content span {
      display: block;
      color: #1e293b;
      font-weight: 700;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .main-layout {
        flex-direction: column;
        padding: 2rem 1.5rem;
        overflow-y: auto;
        height: auto;
      }

      .left-section {
        max-width: 100%;
        margin-bottom: 2rem;
        height: auto;
      }

      .right-section {
        width: 100%;
        max-width: 440px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
      }
    }
  `],
  template: `
    <!-- Background Image & Overlay -->
    <div class="bg-image">
      <img src="assets/images/fondo_pisunpa.png" alt="Fondo Pisunpa" />
    </div>

    <!-- Main Container -->
    <div class="main-layout">
      <!-- LEFT SECTION -->
      <div class="left-section">
        <div class="left-top">
          <div class="university-header">
            <img src="assets/images/logo_unpa.png" alt="Escudo Universidad del Pacífico" class="university-logo-img" />
            <div class="university-text">
              <h2>Universidad<br>del Pacífico</h2>
              <p>Buenaventura, Valle del Cauca</p>
            </div>
          </div>
          <div class="green-accent-line"></div>
        </div>

        <div class="brand-content">
          <h1 class="brand-title">PISUNPA</h1>
          <p class="brand-subtitle">Sistema de Gestión de Egresados</p>
          <p class="brand-slogan">
            Innovar no es una opción, es nuestro próximo paso.<br>
            ¡Construyamos juntos el futuro!
          </p>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="feature-info">
                <h4>Gestión de egresados</h4>
                <p>Conecta con tu futuro</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div class="feature-info">
                <h4>Solicitudes de supletorios</h4>
                <p>Procesos académicos ágiles</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5"/>
                </svg>
              </div>
              <div class="feature-info">
                <h4>Servicios académicos</h4>
                <p>Recursos y herramientas</p>
              </div>
            </div>

            <div class="feature-item">
              <div class="feature-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                  <line x1="2" y1="20" x2="22" y2="20"/>
                </svg>
              </div>
              <div class="feature-info">
                <h4>Seguimiento institucional</h4>
                <p>Información y gestión</p>
              </div>
            </div>
          </div>
        </div>

        <div class="left-footer">
          <span>© 2026 Universidad del Pacífico. Todos los derechos reservados.</span>
        </div>
      </div>

      <!-- RIGHT SECTION - SINGLE FLOATING WHITE FORM CARD -->
      <div class="right-section">
        <div class="card-lock-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h2 class="card-domain">pisunpa.com</h2>
        <p class="card-subtext">Sistema de Gestión de Egresados</p>
        <p class="card-quote">
          Innovar no es una opción, es nuestro próximo paso.<br>
          ¡Construyamos juntos el futuro!
        </p>

        @if (errorMensaje()) {
          <div class="form-error-alert">{{ errorMensaje() }}</div>
        }

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
          <div class="form-field">
            <label for="email">Correo Electrónico</label>
            <div class="input-box">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
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
            </div>
            @if (emailField.invalid && emailField.touched) {
              <div class="field-err-msg">
                @if (emailField.errors?.['required']) { El correo es obligatorio. }
                @else if (emailField.errors?.['email']) { Ingrese un correo válido. }
              </div>
            }
          </div>

          <div class="form-field">
            <label for="password">Contraseña</label>
            <div class="input-box">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="••••••••"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                #passwordField="ngModel"
                [class.invalid]="passwordField.invalid && passwordField.touched"
              />
              <button type="button" class="pw-toggle-btn" (click)="togglePasswordVisibility()">
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
            @if (passwordField.invalid && passwordField.touched) {
              <div class="field-err-msg">
                @if (passwordField.errors?.['required']) { La contraseña es obligatoria. }
                @else if (passwordField.errors?.['minlength']) { Mínimo 6 caracteres. }
              </div>
            }
          </div>

          <button type="submit" class="submit-btn" [disabled]="loginForm.invalid">
            Iniciar Sesión
          </button>
        </form>

        <a class="forgot-link" routerLink="/login">¿Olvidaste tu contraseña?</a>

        <div class="or-divider">
          <div class="or-circle"></div>
        </div>

        <a class="register-box" routerLink="/registro-egresado">
          <div class="register-box-content">
            ¿Eres egresado antiguo y no tienes cuenta?<br>
            <span>Regístrate aquí</span>
          </div>
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
  cargando = signal(false);
  showPassword = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.errorMensaje.set('');

    if (!this.email || !this.password) {
      this.errorMensaje.set('Complete todos los campos.');
      return;
    }

    this.cargando.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.cargarPerfil().subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.cargando.set(false);
            this.errorMensaje.set('Error al cargar el perfil.');
          }
        });
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.errorMensaje.set('Credenciales incorrectas. Inténtalo de nuevo.');
        } else {
          this.errorMensaje.set('Error de conexión. Inténtalo más tarde.');
        }
      }
    });
  }
}
