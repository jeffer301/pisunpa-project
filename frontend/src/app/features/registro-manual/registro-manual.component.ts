import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { UsuariosService } from "../../services/usuarios.service";
import { EgresadosService } from "../../services/egresados.service";
import { FeedbackService } from "../../shared/services/feedback.service";
import { Programa } from "../../models/programa.model";

@Component({
  selector: "app-registro-manual",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Background Image -->
    <div class="bg-image">
      <img src="assets/images/fondo_pisunpa.png" alt="Fondo Pisunpa" />
    </div>

    <!-- Main Container -->
    <div class="main-layout">
      <div class="registro-card">
        <div class="card-header">
          <div class="card-badge">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
            </svg>
          </div>
          <h1>Registro de Egresado</h1>
          <p>
            Completa el formulario para validar tu información<br />como
            egresado de la Universidad del Pacífico.
          </p>
        </div>

        <div class="divider"></div>

        <form
          [formGroup]="formulario"
          (ngSubmit)="enviar()"
          class="register-form"
        >
          <!-- Section 1 -->
          <div class="section-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Información personal
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label for="tipoDocumento">Tipo de documento *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <select
                  id="tipoDocumento"
                  formControlName="tipoDocumento"
                  [class.invalid]="campoInvalido('tipoDocumento')"
                >
                  <option value="" disabled>Seleccione...</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="PA">Pasaporte</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label for="numeroDocumento">Número de documento *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  id="numeroDocumento"
                  formControlName="numeroDocumento"
                  type="text"
                  placeholder="Ingrese su número de documento"
                  [class.invalid]="campoInvalido('numeroDocumento')"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="nombres">Nombres *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="nombres"
                  formControlName="nombres"
                  type="text"
                  placeholder="Ingrese sus nombres"
                  [class.invalid]="campoInvalido('nombres')"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="apellidos">Apellidos *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="apellidos"
                  formControlName="apellidos"
                  type="text"
                  placeholder="Ingrese sus apellidos"
                  [class.invalid]="campoInvalido('apellidos')"
                />
              </div>
            </div>
            <div class="form-field">
              <label for="password">Contraseña *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  formControlName="password"
                  type="password"
                  placeholder="••••••••"
                  [class.invalid]="campoInvalido('password')"
                />
              </div>
            </div>
            <div class="form-field">
              <label for="password2">Confirmar contraseña *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password2"
                  formControlName="password2"
                  type="password"
                  placeholder="••••••••"
                  [class.invalid]="campoInvalido('password2')"
                />
              </div>
            </div>
          </div>

          <!-- Section 2 -->
          <div class="section-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
            </svg>
            Información académica
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label for="anioGrado">Año de grado *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input
                  id="anioGrado"
                  formControlName="anioGrado"
                  type="number"
                  min="1980"
                  max="2099"
                  placeholder="Ingrese el año de grado"
                  [class.invalid]="campoInvalido('anioGrado')"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="email">Correo electrónico *</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  placeholder="ejemplo@unipacifico.edu.co"
                  [class.invalid]="campoInvalido('email')"
                />
              </div>
            </div>
          </div>

          <!-- Section 3 -->
          <div class="section-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
            Información de contacto
          </div>

          <div class="form-grid">
            <div class="form-field full-width">
              <label for="telefono">Teléfono</label>
              <div class="input-box">
                <svg
                  class="field-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
                <input
                  id="telefono"
                  formControlName="telefono"
                  type="tel"
                  placeholder="Ingrese su número de teléfono"
                />
              </div>
            </div>
          </div>

          @if (mensajeExito()) {
            <div class="success-alert">{{ mensajeExito() }}</div>
          }

          <div class="form-actions">
            <a routerLink="/login" class="btn-back">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Volver al login
            </a>
            <button type="submit" class="btn-submit" [disabled]="enviando()">
              {{ enviando() ? "Enviando..." : "Enviar solicitud" }}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          <div class="security-note">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Tu información está protegida y será utilizada únicamente para fines
            académicos.
          </div>
        </form>
      </div>
    </div>
  `,
  styles: `
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap");

    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      min-height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      font-family:
        "Inter",
        -apple-system,
        BlinkMacSystemFont,
        sans-serif;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
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
    }

    .main-layout {
      position: fixed;
      inset: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      box-sizing: border-box;
      overflow-y: auto;
    }

    .registro-card {
      background: #ffffff;
      border-radius: 12px;
      width: 100%;
      max-width: 580px;
      padding: 2.25rem 2.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      box-sizing: border-box;
      margin: auto;
    }

    .card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .card-badge {
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

    .card-badge svg {
      width: 20px;
      height: 20px;
      color: #1e40af;
      stroke-width: 1.5;
    }

    .card-header h1 {
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .card-header p {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
      line-height: 1.5;
    }

    .divider {
      height: 1px;
      background: #f1f5f9;
      margin: 2rem 0;
      width: 100%;
    }

    .register-form {
      width: 100%;
      background: transparent !important;
      padding: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
      border-radius: 0 !important;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1.25rem;
      margin-top: 2rem;
    }

    .section-title:first-of-type {
      margin-top: 0;
    }

    .section-title svg {
      width: 18px;
      height: 18px;
      color: #15803d;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-field {
      width: 100%;
    }

    .full-width {
      grid-column: 1 / -1;
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

    .input-box input,
    .input-box select {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 2.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #ffffff;
      font-family: inherit;
      box-sizing: border-box;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
      appearance: none;
    }

    .input-box input:focus,
    .input-box select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .input-box input.invalid,
    .input-box select.invalid {
      border-color: #ef4444;
    }

    .input-box input::placeholder,
    .input-box select::placeholder {
      color: #94a3b8;
    }

    .input-box select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }

    .success-alert {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 6px;
      padding: 1rem;
      font-size: 0.9rem;
      margin-top: 1.5rem;
      text-align: center;
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
      justify-content: space-between;
      gap: 1.5rem;
      margin-top: 2.5rem;
    }

    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 50%;
      height: 48px;
      padding: 0 1.5rem;
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      box-sizing: border-box;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-back:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .btn-back svg {
      width: 18px;
      height: 18px;
    }

    .error-msg {
      color: #c0392b;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 50%;
      height: 48px;
      padding: 0 1.5rem;
      margin: 0;
      background: linear-gradient(90deg, #0f172a 0%, #15803d 100%);
      color: #ffffff;
      border: 1px solid transparent;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      box-sizing: border-box;
      box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
      transition: all 0.3s ease;
    }

    .btn-submit:hover {
      background: linear-gradient(90deg, #1e293b 0%, #166534 100%);
      box-shadow: 0 6px 16px rgba(21, 128, 61, 0.35);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-submit svg {
      width: 18px;
      height: 18px;
    }

    .security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 1.5rem;
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .security-note svg {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-actions {
        flex-direction: column-reverse;
      }
      .btn-back,
      .btn-submit {
        width: 100%;
      }
      .registro-card {
        padding: 2rem 1.5rem;
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

  mensajeExito = signal("");
  error = signal("");
  enviando = signal(false);
  programas: Programa[] = [];

  formulario: FormGroup = this.fb.group({
    tipoDocumento: ["", Validators.required],
    numeroDocumento: ["", Validators.required],
    nombres: ["", Validators.required],
    apellidos: ["", Validators.required],
    anioGrado: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    telefono: [""],
    password: ["", [Validators.required, Validators.minLength(8)]],
    password2: ["", Validators.required],
    programa_id: ["", Validators.required],
  });

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe((p) => (this.programas = p));
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
    this.error.set("");

    const val = this.formulario.value;

    this.usuariosService
      .registroConRol({
        email: val.email,
        password: val.password,
        password2: val.password2,
        first_name: val.nombres,
        last_name: val.apellidos,
        documento: val.numeroDocumento,
        telefono: val.telefono,
        tipo_usuario: "egresado",
        programa_id: val.programa_id,
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.feedback.show(res.mensaje, "success");
          this.mensajeExito.set(
            "Registro exitoso. Tu perfil será validado por el Coordinador de Egresados.",
          );
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 3000);
        },
        error: (err) => {
          this.enviando.set(false);
          const msg =
            err.error?.detail ||
            err.error?.email?.[0] ||
            err.error?.documento?.[0] ||
            err.error?.password?.[0] ||
            "Error al registrar. Intenta de nuevo.";
          this.error.set(msg);
        },
      });
  }
}
