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
  template: `
    <div class="contenedor">
      <div class="header">
        <h2>Crear cuenta</h2>
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
      }

      @if (mensajeError()) {
        <div class="aviso-error">{{ mensajeError() }}</div>
      }

      @if (!rolSeleccionado() && !mensajeExito()) {
        <div class="role-cards">
          <button class="role-card" (click)="seleccionarRol('estudiante')">
            <span class="role-icon">&#x1F393;</span>
            <span class="role-title">Soy Estudiante</span>
            <span class="role-desc">Si cursas actualmente un programa académico en la Universidad del Pacífico</span>
          </button>
          <button class="role-card" (click)="seleccionarRol('egresado')">
            <span class="role-icon">&#x1F393;</span>
            <span class="role-title">Soy Egresado</span>
            <span class="role-desc">Si ya culminaste tus estudios y eres graduado de la Universidad del Pacífico</span>
          </button>
        </div>
      }

      @if (rolSeleccionado() && !mensajeExito()) {
        <form [formGroup]="formulario" (ngSubmit)="registrar()">
          <button type="button" class="btn-back-role" (click)="volver()">
            &larr; Cambiar tipo de registro
          </button>

          <div class="row">
            <div class="campo">
              <label for="first_name">Nombres *</label>
              <input id="first_name" formControlName="first_name" placeholder="Nombres" />
              @if (campoInvalido('first_name')) {
                <span class="error">Campo obligatorio.</span>
              }
            </div>
            <div class="campo">
              <label for="last_name">Apellidos *</label>
              <input id="last_name" formControlName="last_name" placeholder="Apellidos" />
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
              <input id="documento" formControlName="documento" placeholder="C.C. 1234567890" />
              @if (campoInvalido('documento')) {
                <span class="error">Campo obligatorio.</span>
              }
            </div>
            <div class="campo">
              <label for="telefono">Teléfono</label>
              <input id="telefono" formControlName="telefono" placeholder="Opcional" />
            </div>
          </div>

          @if (rolSeleccionado() === 'egresado') {
            <div class="campo">
              <label for="programa">Programa Académico *</label>
              <select id="programa" formControlName="programa_id">
                <option value="">Seleccione un programa</option>
                @for (p of programas(); track p.id) {
                  <option [value]="p.id">{{ p.nombre }}</option>
                }
              </select>
              @if (campoInvalido('programa_id')) {
                <span class="error">Seleccione un programa.</span>
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
              <label for="password2">Confirmar contraseña *</label>
              <input id="password2" type="password" formControlName="password2" placeholder="Repita la contraseña" />
              @if (campoInvalido('password2')) {
                <span class="error">Las contraseñas no coinciden.</span>
              }
            </div>
          </div>

          <button type="submit" [disabled]="formulario.invalid || guardando()">
            {{ guardando() ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </form>
      }

      <div class="enlaces">
        <a routerLink="/login">¿Ya tienes cuenta? Inicia sesión</a>
      </div>
    </div>
  `,
  styles: [`
    .contenedor {
      max-width: 560px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .header { text-align: center; margin-bottom: 1.5rem; }
    h2 { color: #0a2463; margin-bottom: 0.25rem; }
    .subtitulo { color: #666; font-size: 0.9rem; }

    .role-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .role-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .role-card:hover {
      border-color: #3da5d9;
      background: #f0f8ff;
    }
    .role-card:focus-visible {
      outline: 2px solid #3da5d9;
      outline-offset: 2px;
    }
    .role-icon { font-size: 2.5rem; }
    .role-title { font-size: 1.1rem; font-weight: 700; color: #0a2463; }
    .role-desc { font-size: 0.8rem; color: #666; text-align: center; line-height: 1.4; }

    .btn-back-role {
      background: none;
      border: none;
      color: #3da5d9;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0;
      margin-bottom: 1rem;
      font-family: inherit;
    }
    .btn-back-role:hover { text-decoration: underline; }

    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .campo { margin-bottom: 1rem; }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    input, select {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 2px rgba(61,165,217,0.2);
    }
    select { background: white; }
    .error {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: #0a2463;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .aviso-exito {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .aviso-exito strong { display: block; margin-bottom: 0.5rem; }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .enlaces { text-align: center; margin-top: 1rem; }
    .enlaces a { color: #3da5d9; text-decoration: none; }

    @media (max-width: 600px) {
      .role-cards { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; }
    }
  `]
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
