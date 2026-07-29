import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-registro-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Registro de Estudiante</h2>
      <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>

      @if (mensajeExito()) {
        <div class="aviso-exito">
          <strong>{{ mensajeExito() }}</strong>
          <p>Tu cuenta será revisada por el director o administrador. Recibirás acceso una vez sea aprobada.</p>
        </div>
      }

      @if (mensajeError()) {
        <div class="aviso-error">{{ mensajeError() }}</div>
      }

      @if (!mensajeExito()) {
        <form [formGroup]="formulario" (ngSubmit)="registrar()">
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

          <div class="campo">
            <label for="email">Correo electrónico *</label>
            <input id="email" type="email" formControlName="email" placeholder="correo@ejemplo.com" />
            @if (campoInvalido('email')) {
              <span class="error">Ingrese un correo válido.</span>
            }
          </div>

          <div class="campo">
            <label for="documento_identidad">Documento de Identidad (C.C. / T.I.) *</label>
            <input id="documento_identidad" formControlName="documento_identidad" placeholder="Ej: CC 1234567890" />
            @if (campoInvalido('documento_identidad')) {
              <span class="error">Campo obligatorio.</span>
            }
          </div>

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

          <button type="submit" [disabled]="formulario.invalid || guardando()">
            {{ guardando() ? 'Registrando...' : 'Registrarse' }}
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
      max-width: 480px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h2 {
      color: #0a2463;
      text-align: center;
      margin-bottom: 0.25rem;
    }
    .subtitulo {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .campo {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
    }
    input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 2px rgba(61,165,217,0.2);
    }
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
    .aviso-exito strong {
      display: block;
      margin-bottom: 0.5rem;
    }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .enlaces {
      text-align: center;
      margin-top: 1rem;
    }
    .enlaces a {
      color: #3da5d9;
      text-decoration: none;
    }
  `]
})
export class RegistroEstudianteComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  formulario: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento_identidad: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  registrar(): void {
    if (this.formulario.invalid) return;
    this.guardando.set(true);
    this.mensajeError.set('');

    const body = {
      ...this.formulario.value,
      tipo_usuario: 'estudiante',
      documento: this.formulario.value.documento_identidad,
    };

    this.http.post(`${environment.apiUrl}/usuarios/registro-con-rol/`, body)
      .subscribe({
        next: () => {
          this.mensajeExito.set('Tu cuenta está pendiente de aprobación por el director/administrador.');
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
