import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProfesorService } from '../../services/profesor.service';

@Component({
  selector: 'app-registro-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      @if (tokenValido()) {
        <div class="aviso-info">
          Registro mediante invitación — <strong>{{ emailPrefill() }}</strong>
        </div>
      }
      <h2>Registro de Docente</h2>
      <p class="subtitulo">Universidad del Pacífico — Buenaventura</p>

      @if (mensajeExito()) {
        <div class="aviso-exito">
          {{ mensajeExito() }}
          <a routerLink="/login">Ir al inicio de sesión</a>
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

          @if (!tokenValido()) {
            <div class="campo">
              <label for="email">Correo electrónico *</label>
              <input id="email" type="email" formControlName="email" placeholder="correo@ejemplo.com" />
              @if (campoInvalido('email')) {
                <span class="error">Ingrese un correo válido.</span>
              }
            </div>
          }

          <div class="campo">
            <label for="documento_identidad">Documento de Identidad *</label>
            <input id="documento_identidad" formControlName="documento_identidad" placeholder="Número de documento" />
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
    .aviso-info {
      background: #d1ecf1;
      color: #0c5460;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
    .campo { margin-bottom: 1rem; }
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
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 1rem;
    }
    .aviso-exito a {
      display: block;
      margin-top: 0.5rem;
      color: #0a2463;
      font-weight: 600;
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
export class RegistroDocenteComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private profesorService = inject(ProfesorService);

  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');
  token = signal<string | null>(null);
  emailPrefill = signal('');
  tokenValido = signal(false);

  formulario: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    documento_identidad: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', Validators.required],
  });

  constructor() {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token.set(tokenParam);
      this.cargarInvitacion(tokenParam);
    }
  }

  cargarInvitacion(token: string): void {
    this.profesorService.detalleInvitacion(token).subscribe({
      next: (inv) => {
        this.emailPrefill.set(inv.email);
        this.tokenValido.set(true);
        this.formulario.patchValue({
          first_name: inv.first_name,
          last_name: inv.last_name,
          email: inv.email,
        });
      },
      error: (err) => {
        if (err.status === 410) {
          this.mensajeError.set('La invitación ha expirado o ya fue utilizada.');
        } else {
          this.mensajeError.set('El enlace de invitación no es válido.');
        }
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  registrar(): void {
    if (this.formulario.invalid) return;
    this.guardando.set(true);
    this.mensajeError.set('');

    const token = this.token();
    const payload = this.formulario.value;

    if (token) {
      payload.token = token;
      this.http.post(`${environment.apiUrl}/usuarios/registro-docente-con-token/`, payload)
        .subscribe({
          next: () => {
            this.mensajeExito.set('Registro exitoso. Ya puedes iniciar sesión.');
            this.guardando.set(false);
          },
          error: (err) => {
            const msg = err.error?.detail || err.error?.mensaje || 'Error al registrar. Intente nuevamente.';
            this.mensajeError.set(msg);
            this.guardando.set(false);
          }
        });
    } else {
      this.http.post(`${environment.apiUrl}/usuarios/registro-docente/`, payload)
        .subscribe({
          next: () => {
            this.mensajeExito.set('Registro exitoso. Ya puedes iniciar sesión.');
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
}
