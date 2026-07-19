import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-registro-manual',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="registro-container">
      <div class="registro-card">
        <div class="registro-header">
          <h1>Registro de Egresado</h1>
          <p>Si ya eres egresado de la Universidad del Pacífico, completa el formulario para que tu información sea validada por el Coordinador de Egresados.</p>
        </div>

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
              <label for="anioGrado">Año de Grado *</label>
              <input id="anioGrado" formControlName="anioGrado" type="number" min="1980" max="2099" />
              @if (campoInvalido('anioGrado')) {
                <span class="error">El año de grado es requerido.</span>
              }
            </div>
            <div class="campo">
              <label for="email">Correo Electrónico *</label>
              <input id="email" formControlName="email" type="email" />
              @if (campoInvalido('email')) {
                <span class="error">El correo electrónico es requerido.</span>
              }
            </div>
            <div class="campo campo-full">
              <label for="telefono">Teléfono</label>
              <input id="telefono" formControlName="telefono" type="tel" />
            </div>
          </div>

          <div class="form-actions">
            @if (mensajeExito()) {
              <span class="exito">{{ mensajeExito() }}</span>
            }
            <button type="submit" class="btn-submit" [disabled]="enviando()">
              {{ enviando() ? 'Enviando...' : 'Enviar Solicitud' }}
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

    .form-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .form-actions .exito {
      margin-top: 0;
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

    @media (max-width: 720px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class RegistroManualComponent {
  private fb = inject(FormBuilder);
  private feedback = inject(FeedbackService);

  mensajeExito = signal('');
  enviando = signal(false);

  formulario: FormGroup = this.fb.group({
    tipoDocumento: ['', Validators.required],
    numeroDocumento: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    anioGrado: [null, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
  });

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

    setTimeout(() => {
      this.feedback.show(
        'Solicitud enviada al Coordinador de Egresados. Pendiente de Validación.',
        'success'
      );
      this.mensajeExito.set('Solicitud enviada exitosamente. Recibirás un correo cuando sea validada.');
      this.enviando.set(false);
      this.formulario.reset();
      setTimeout(() => this.mensajeExito.set(''), 5000);
    }, 1000);
  }
}
