import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Programa } from '../../models/programa.model';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-registro-manual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="registro-container">
      <div class="registro-card">
        <div class="registro-header">
          <h1>Registro de Egresado</h1>
          <p>Si ya eres egresado de la Universidad del Pacífico, completa el formulario para que tu información sea validada por el Coordinador de Egresados.</p>
        </div>

        @if (mensajeExito()) {
          <div class="aviso-exito">
            <strong>{{ mensajeExito() }}</strong>
            <p>Tu cuenta será revisada por el coordinador. Recibirás acceso una vez sea validada.</p>
          </div>
        }

        @if (mensajeError()) {
          <div class="aviso-error">{{ mensajeError() }}</div>
        }

        @if (!mensajeExito()) {
          <form [formGroup]="formulario" (ngSubmit)="enviar()">
            <div class="form-grid">
              <div class="campo">
                <label for="tipoDocumento">Tipo de documento *</label>
                <select id="tipoDocumento" formControlName="tipoDocumento">
                  <option value="" disabled>Seleccione...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PA">Pasaporte</option>
                </select>
                @if (campoInvalido('tipoDocumento')) {
                  <span class="error">El tipo de documento es requerido.</span>
                }
              </div>
              <div class="campo">
                <label for="numeroDocumento">Número de documento *</label>
                <input id="numeroDocumento" formControlName="numeroDocumento" type="text" />
                @if (campoInvalido('numeroDocumento')) {
                  <span class="error">El número de documento es requerido.</span>
                }
              </div>
              <div class="campo">
                <label for="nombres">Nombres *</label>
                <input id="nombres" formControlName="nombres" type="text" />
                @if (campoInvalido('nombres')) {
                  <span class="error">Los nombres son requeridos.</span>
                }
              </div>
              <div class="campo">
                <label for="apellidos">Apellidos *</label>
                <input id="apellidos" formControlName="apellidos" type="text" />
                @if (campoInvalido('apellidos')) {
                  <span class="error">Los apellidos son requeridos.</span>
                }
              </div>
              <div class="campo">
                <label for="email">Correo Electrónico *</label>
                <input id="email" formControlName="email" type="email" />
                @if (campoInvalido('email')) {
                  <span class="error">El correo electrónico es requerido.</span>
                }
              </div>
              <div class="campo">
                <label for="telefono">Teléfono</label>
                <input id="telefono" formControlName="telefono" type="tel" />
              </div>
              <div class="campo">
                <label for="programa">Programa Académico *</label>
                <select id="programa" formControlName="programa_id">
                  <option value="" disabled>Seleccione un programa</option>
                  @for (p of programas(); track p.id) {
                    <option [value]="p.id">{{ p.nombre }}</option>
                  }
                </select>
                @if (campoInvalido('programa_id')) {
                  <span class="error">El programa es requerido.</span>
                }
              </div>
              <div class="campo">
                <label for="password">Contraseña *</label>
                <input id="password" formControlName="password" type="password" />
                @if (campoInvalido('password')) {
                  <span class="error">Mínimo 8 caracteres.</span>
                }
              </div>
              <div class="campo">
                <label for="password2">Confirmar contraseña *</label>
                <input id="password2" formControlName="password2" type="password" />
                @if (campoInvalido('password2')) {
                  <span class="error">Las contraseñas no coinciden.</span>
                }
              </div>
            </div>

            <div class="form-actions">
              <a class="btn-back" routerLink="/login">Volver al Inicio de Sesión</a>
              <button type="submit" class="btn-submit" [disabled]="formulario.invalid || enviando()">
                {{ enviando() ? 'Enviando...' : 'Enviar Solicitud' }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }

    .registro-container {
      max-width: 640px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .registro-card {
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .registro-header {
      background: var(--color-primary);
      color: #fff;
      padding: 1.75rem 1.5rem;
    }

    .registro-header h1 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }

    .registro-header p {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }

    .registro-card form {
      padding: 1.5rem;
      margin-top: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .campo-full {
      grid-column: 1 / -1;
    }

    .campo select, .campo input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fff;
      box-sizing: border-box;
    }

    .campo select:focus, .campo input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(10, 36, 99, 0.15);
    }

    .error {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-submit {
      background: var(--color-primary);
      color: #fff;
      padding: 0.6rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-submit:hover {
      background: #163d8f;
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-back {
      display: inline-block;
      padding: 0.6rem 1.25rem;
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }

    .btn-back:hover {
      background: var(--color-primary);
      color: #fff;
    }

    .aviso-exito {
      background: #fff3cd;
      color: #856404;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 1.5rem;
    }

    .aviso-exito strong {
      display: block;
      margin-bottom: 0.5rem;
    }

    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin: 1rem 1.5rem;
    }

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class RegistroManualComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private feedback = inject(FeedbackService);

  programas = signal<Programa[]>([]);
  mensajeExito = signal('');
  mensajeError = signal('');
  enviando = signal(false);

  formulario: FormGroup = this.fb.group({
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    programa_id: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  ngOnInit(): void {
    this.http.get<Programa[]>(`${environment.apiUrl}/egresados/programas/`)
      .subscribe({ next: (data) => this.programas.set(data) });
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set('');

    const v = this.formulario.value;
    const body = {
      email: v.email,
      password: v.password,
      password2: v.password2,
      first_name: v.nombres,
      last_name: v.apellidos,
      documento: v.numeroDocumento,
      documento_identidad: v.numeroDocumento,
      telefono: v.telefono || '',
      tipo_usuario: 'egresado',
      programa_id: v.programa_id,
    };

    this.http.post(`${environment.apiUrl}/usuarios/registro-con-rol/`, body)
      .subscribe({
        next: (res: any) => {
          this.mensajeExito.set(res.mensaje || 'Solicitud enviada. Pendiente de validación.');
          this.feedback.show('Solicitud enviada al Coordinador de Egresados.', 'success');
          this.enviando.set(false);
        },
        error: (err) => {
          const msg = err.error?.detail || err.error?.mensaje || JSON.stringify(err.error) || 'Error al registrar.';
          this.mensajeError.set(msg);
          this.enviando.set(false);
        }
      });
  }
}
