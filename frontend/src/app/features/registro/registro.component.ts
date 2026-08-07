import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Programa } from '../../models/programa.model';

type TipoUsuario = 'estudiante' | 'egresado';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :host {
      display: block;
      width: 100vw;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      overflow-x: hidden;
    }

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
      filter: contrast(1.08) brightness(1.02);
    }

    .main-wrapper {
      position: relative;
      z-index: 2;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      box-sizing: border-box;
    }

    .card-container {
      background: #ffffff;
      border-radius: 16px;
      padding: 2.5rem 3rem;
      width: 100%;
      max-width: 620px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
      box-sizing: border-box;
    }

    .header-box {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-img {
      height: 60px;
      width: auto;
      margin-bottom: 0.75rem;
    }

    .header-box h2 {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 0.25rem;
    }

    .subtitulo {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* Role selection cards */
    .role-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .role-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      padding: 2rem 1.25rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.25s ease;
      font-family: inherit;
    }

    .role-card:hover {
      border-color: #15803d;
      background: #f0fdf4;
      transform: translateY(-3px);
      box-shadow: 0 10px 20px rgba(21, 128, 61, 0.08);
    }

    .role-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(21, 128, 61, 0.1);
      color: #15803d;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .role-icon svg {
      width: 26px;
      height: 26px;
    }

    .role-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
    }

    .role-desc {
      font-size: 0.8rem;
      color: #64748b;
      text-align: center;
      line-height: 1.4;
    }

    .btn-back-role {
      background: none;
      border: none;
      color: #15803d;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      margin-bottom: 1.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-family: inherit;
    }

    .btn-back-role:hover {
      text-decoration: underline;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .campo {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 700;
      color: #1e293b;
      font-size: 0.85rem;
    }

    input, select {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      box-sizing: border-box;
      font-family: inherit;
      background: #ffffff;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #15803d;
      box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.12);
    }

    .error {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.3rem;
      font-weight: 500;
    }

    .submit-btn {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(90deg, #0f172a 0%, #15803d 100%);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 4px 14px rgba(21, 128, 61, 0.3);
      transition: all 0.3s ease;
      margin-top: 0.75rem;
    }

    .submit-btn:hover {
      background: linear-gradient(90deg, #1e293b 0%, #166534 100%);
      box-shadow: 0 6px 18px rgba(21, 128, 61, 0.45);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .aviso-exito {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
      padding: 1.25rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .aviso-exito strong {
      display: block;
      font-size: 1.05rem;
      margin-bottom: 0.5rem;
    }

    .aviso-exito p {
      font-size: 0.88rem;
      margin: 0;
    }

    .aviso-error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      padding: 0.85rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.88rem;
      text-align: center;
    }

    .enlaces {
      text-align: center;
      margin-top: 1.5rem;
    }

    .enlaces a {
      color: #2563eb;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
    }

    .enlaces a:hover {
      text-decoration: underline;
    }

    @media (max-width: 640px) {
      .card-container { padding: 2rem 1.5rem; }
      .role-cards { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; }
    }
  `],
  template: `
    <!-- Background Image -->
    <div class="bg-image">
      <img src="assets/images/fondo_pisunpa.png" alt="Fondo Pisunpa" />
    </div>

    <!-- Main Wrapper -->
    <div class="main-wrapper">
      <div class="card-container">
        <div class="header-box">
          <img src="assets/images/logo_unpa.png" alt="Logo UNPA" class="logo-img" />
          <h2>Crear Cuenta Institucional</h2>
          <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>
        </div>

        @if (mensajeExito()) {
          <div class="aviso-exito">
            <strong>{{ mensajeExito() }}</strong>
            @if (rolSeleccionado() === 'estudiante') {
              <p>Tu cuenta será revisada por el director o administrador. Recibirás acceso una vez sea aprobada.</p>
            }
            @if (rolSeleccionado() === 'egresado') {
              <p>Tu información será validada por el Coordinador de Egresados.</p>
            }
          </div>
          <div class="enlaces">
            <a routerLink="/login" class="submit-btn" style="display: block; text-decoration: none;">Ir al Inicio de Sesión</a>
          </div>
        }

        @if (mensajeError()) {
          <div class="aviso-error">{{ mensajeError() }}</div>
        }

        @if (!rolSeleccionado() && !mensajeExito()) {
          <div class="role-cards">
            <button class="role-card" (click)="seleccionarRol('estudiante')">
              <div class="role-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span class="role-title">Soy Estudiante</span>
              <span class="role-desc">Si cursas actualmente un programa académico en la Universidad del Pacífico</span>
            </button>
            <button class="role-card" (click)="seleccionarRol('egresado')">
              <div class="role-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="role-title">Soy Egresado</span>
              <span class="role-desc">Si ya culminaste tus estudios y eres graduado de la Universidad del Pacífico</span>
            </button>
          </div>

          <div class="enlaces">
            <a routerLink="/login">¿Ya tienes cuenta? Inicia Sesión</a>
          </div>
        }

        @if (rolSeleccionado() && !mensajeExito()) {
          <form [formGroup]="formulario" (ngSubmit)="registrar()">
            <button type="button" class="btn-back-role" (click)="volver()">
              ← Cambiar tipo de registro ({{ rolSeleccionado() | titlecase }})
            </button>

            <div class="row">
              <div class="campo">
                <label for="first_name">Nombres *</label>
                <input id="first_name" formControlName="first_name" placeholder="Tus nombres" />
                @if (campoInvalido('first_name')) {
                  <span class="error">Campo obligatorio.</span>
                }
              </div>
              <div class="campo">
                <label for="last_name">Apellidos *</label>
                <input id="last_name" formControlName="last_name" placeholder="Tus apellidos" />
                @if (campoInvalido('last_name')) {
                  <span class="error">Campo obligatorio.</span>
                }
              </div>
            </div>

            <div class="campo">
              <label for="email">Correo electrónico *</label>
              <input id="email" type="email" formControlName="email" placeholder="correo@ejemplo.com" />
              @if (campoInvalido('email')) {
                <span class="error">Ingrese un correo válido.</span>
              }
            </div>

            <div class="row">
              <div class="campo">
                <label for="documento">Documento de Identidad *</label>
                <input id="documento" formControlName="documento" placeholder="Ej: 1234567890" />
                @if (campoInvalido('documento')) {
                  <span class="error">Campo obligatorio.</span>
                }
              </div>
              <div class="campo">
                <label for="telefono">Teléfono / Celular</label>
                <input id="telefono" formControlName="telefono" placeholder="Número de contacto" />
              </div>
            </div>

            @if (rolSeleccionado() === 'egresado') {
              <div class="campo">
                <label for="programa_id">Programa Académico Graduado *</label>
                <select id="programa_id" formControlName="programa_id">
                  <option value="">Seleccione su programa...</option>
                  @for (prog of programas(); track prog.id) {
                    <option [value]="prog.id">{{ prog.nombre }}</option>
                  }
                </select>
                @if (campoInvalido('programa_id')) {
                  <span class="error">Seleccione su programa académico.</span>
                }
              </div>
            }

            <div class="row">
              <div class="campo">
                <label for="password">Contraseña *</label>
                <input id="password" type="password" formControlName="password" placeholder="Mínimo 8 caracteres" />
                @if (campoInvalido('password')) {
                  <span class="error">Mínimo 8 caracteres.</span>
                }
              </div>
              <div class="campo">
                <label for="password2">Confirmar Contraseña *</label>
                <input id="password2" type="password" formControlName="password2" placeholder="Repita la contraseña" />
                @if (campoInvalido('password2')) {
                  <span class="error">Campo obligatorio.</span>
                }
              </div>
            </div>

            <button type="submit" class="submit-btn" [disabled]="guardando()">
              {{ guardando() ? 'Procesando registro...' : 'Completar Registro' }}
            </button>
          </form>

          <div class="enlaces">
            <a routerLink="/login">¿Ya tienes una cuenta? Iniciar Sesión</a>
          </div>
        }
      </div>
    </div>
  `
})
export class RegistroComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  rolSeleccionado = signal<TipoUsuario | null>(null);
  programas = signal<Programa[]>([]);
  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  formulario: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento: ['', Validators.required],
    telefono: [''],
    programa_id: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  seleccionarRol(rol: TipoUsuario): void {
    this.rolSeleccionado.set(rol);
    this.mensajeError.set('');

    if (rol === 'egresado') {
      this.formulario.get('programa_id')?.setValidators(Validators.required);
      this.cargarProgramas();
    } else {
      this.formulario.get('programa_id')?.clearValidators();
    }
    this.formulario.get('programa_id')?.updateValueAndValidity();
  }

  volver(): void {
    this.rolSeleccionado.set(null);
    this.mensajeError.set('');
  }

  cargarProgramas(): void {
    this.http.get<Programa[]>(`${environment.apiUrl}/egresados/programas/`)
      .subscribe({ next: (data) => this.programas.set(data) });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');

    const v = this.formulario.value;
    const body: any = {
      email: v.email,
      password: v.password,
      password2: v.password2,
      first_name: v.first_name,
      last_name: v.last_name,
      documento: v.documento,
      documento_identidad: v.documento,
      telefono: v.telefono || '',
      tipo_usuario: this.rolSeleccionado(),
    };

    if (this.rolSeleccionado() === 'egresado') {
      body.programa_id = v.programa_id;
    }

    this.http.post(`${environment.apiUrl}/usuarios/registro-con-rol/`, body)
      .subscribe({
        next: (res: any) => {
          this.mensajeExito.set(res.mensaje || 'Registro exitoso.');
          this.guardando.set(false);
        },
        error: (err) => {
          const msg = err.error?.detail || err.error?.mensaje || 'Error al registrar. Intente nuevamente.';
          this.mensajeError.set(msg);
          this.guardando.set(false);
        }
      });
  }
}
