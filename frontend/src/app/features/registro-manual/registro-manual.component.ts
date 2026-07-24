import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { EgresadosService } from '../../services/egresados.service';
import { FeedbackService } from '../../shared/services/feedback.service';
import { Programa } from '../../models/programa.model';

@Component({
  selector: 'app-registro-manual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="registro-container">
      <div class="registro-card">
        <div class="registro-header">
          <h1>Registro en PisunPA</h1>
          <p>Crea tu cuenta. Si eres egresado, tu perfil será validado por el Coordinador de Egresados.</p>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="enviar()">

          <div class="campo campo-full">
            <label>¿Quién eres? *</label>
            <div class="campo-radio">
              <label class="radio-label">
                <input type="radio" formControlName="tipo_usuario" value="estudiante" />
                Estudiante
              </label>
              <label class="radio-label">
                <input type="radio" formControlName="tipo_usuario" value="egresado" />
                Egresado
              </label>
            </div>
          </div>

          <div class="form-grid">
            <div class="campo">
              <label for="email">Correo Electrónico *</label>
              <input id="email" formControlName="email" type="email" placeholder="tu@correo.com" />
              @if (campoInvalido('email')) {
                <span class="error">El correo electrónico es requerido.</span>
              }
            </div>
            <div class="campo">
              <label for="documento">Número de documento *</label>
              <input id="documento" formControlName="documento" type="text" />
              @if (campoInvalido('documento')) {
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
              <label for="telefono">Teléfono</label>
              <input id="telefono" formControlName="telefono" type="tel" />
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

          @if (formulario.get('tipo_usuario')?.value === 'egresado') {
            <fieldset class="egresado-fields">
              <legend>Datos de egresado</legend>

              <div class="form-grid">
                <div class="campo campo-full">
                  <label for="programa_id">Programa académico *</label>
                  <select id="programa_id" formControlName="programa_id">
                    <option value="">Seleccione un programa</option>
                    @for (p of programas; track p.id) {
                      <option [value]="p.id">{{ p.nombre }}</option>
                    }
                  </select>
                  @if (campoInvalido('programa_id')) {
                    <span class="error">El programa es requerido para egresados.</span>
                  }
                </div>
                <div class="campo campo-full">
                  <label for="direccion_residencia">Dirección de residencia</label>
                  <input id="direccion_residencia" formControlName="direccion_residencia" type="text" />
                </div>
                <div class="campo campo-full">
                  <label for="biografia">Biografía</label>
                  <textarea id="biografia" formControlName="biografia" rows="3"></textarea>
                </div>
              </div>
            </fieldset>
          }

          <div class="form-actions">
            @if (error()) {
              <span class="error-msg">{{ error() }}</span>
            }
            @if (mensajeExito()) {
              <span class="exito">{{ mensajeExito() }}</span>
            }
            <a class="btn-back" routerLink="/login">Volver al Inicio de Sesión</a>
            <button type="submit" class="btn-submit" [disabled]="formulario.invalid || enviando()">
              {{ enviando() ? 'Registrando...' : 'Registrarse' }}
            </button>
          </div>
        </form>
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

    .campo select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fff;
    }

    .campo select:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(10, 36, 99, 0.15);
    }

    .campo-radio {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.4rem;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .egresado-fields {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 1rem 0;
    }

    .egresado-fields legend {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--color-primary);
      padding: 0 0.5rem;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .form-actions .exito {
      margin-top: 0;
    }

    .error-msg {
      color: #c0392b;
      font-size: 0.85rem;
      font-weight: 500;
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

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class RegistroManualComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private egresadosService = inject(EgresadosService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  mensajeExito = signal('');
  error = signal('');
  enviando = signal(false);
  programas: Programa[] = [];

  formulario: FormGroup = this.fb.group({
    tipo_usuario: ['estudiante', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    telefono: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
    programa_id: [''],
    direccion_residencia: [''],
    biografia: [''],
  });

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => this.programas = p);

    this.formulario.get('tipo_usuario')!.valueChanges.subscribe(tipo => {
      const prog = this.formulario.get('programa_id')!;
      if (tipo === 'egresado') {
        prog.setValidators(Validators.required);
      } else {
        prog.clearValidators();
      }
      prog.updateValueAndValidity();
    });
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
    this.error.set('');

    const val = this.formulario.value;

    this.usuariosService.registroConRol({
      email: val.email,
      password: val.password,
      password2: val.password2,
      first_name: val.nombres,
      last_name: val.apellidos,
      documento: val.documento,
      telefono: val.telefono,
      tipo_usuario: val.tipo_usuario,
      programa_id: val.programa_id || undefined,
      direccion_residencia: val.direccion_residencia,
      biografia: val.biografia,
    }).subscribe({
      next: (res) => {
        this.enviando.set(false);
        this.feedback.show(res.mensaje, 'success');
        this.mensajeExito.set(
          val.tipo_usuario === 'egresado'
            ? 'Registro exitoso. Tu perfil será validado por el Coordinador de Egresados.'
            : 'Registro exitoso. Ya puedes iniciar sesión.'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.enviando.set(false);
        const msg = err.error?.detail
          || err.error?.email?.[0]
          || err.error?.documento?.[0]
          || err.error?.password?.[0]
          || 'Error al registrar. Intenta de nuevo.';
        this.error.set(msg);
      }
    });
  }
}
