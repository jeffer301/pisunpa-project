import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfesorService } from '../../../services/profesor.service';
import { Profesor } from '../../../models/profesor.model';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <div class="admin-header">
        <div>
          <h2>Gestión de Profesores</h2>
          <p class="subtitulo">Importar profesores desde Excel y gestionar invitaciones</p>
        </div>
      </div>

      <div class="toolbar">
        <label class="file-btn">
          {{ importando() ? 'Importando...' : 'Importar Excel' }}
          <input
            type="file"
            accept=".xlsx,.xls"
            [disabled]="importando()"
            (change)="importarExcel($event)"
          />
        </label>
      </div>

      @if (resultadoImportacion(); as r) {
        <div class="card-resumen" [class.exito]="r.creados > 0" [class.sin-cambios]="r.creados === 0">
          <strong>Resultado de importación:</strong>
          {{ r.creados }} creados, {{ r.duplicados }} duplicados
          @if (r.errores?.length) {
            <span class="errores"> — {{ r.errores.length }} errores</span>
          }
        </div>
      }

      @if (cargando()) {
        <p class="cargando">Cargando profesores...</p>
      }

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Invitación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of profesores(); track p.id) {
              <tr>
                <td>{{ p.first_name }} {{ p.last_name }}</td>
                <td>{{ p.email }}</td>
                <td>
                  <span class="estado-badge" [class.activo]="p.estado === 'aprobado'" [class.inactivo]="p.estado !== 'aprobado'">
                    {{ p.estado === 'aprobado' ? 'Activo' : 'Pendiente' }}
                  </span>
                </td>
                <td>
                  @if (p.invitacion_enviada && p.invitacion_usada) {
                    <span class="tag-ok">✓ Usada</span>
                  } @else if (p.invitacion_enviada) {
                    <span class="tag-pendiente">○ Pendiente</span>
                  } @else {
                    <span class="tag-inactiva">— No enviada</span>
                  }
                </td>
                <td class="acciones">
                  @if (!p.invitacion_usada) {
                    <button class="btn-invitar" (click)="invitar(p)" [disabled]="invitandoId() === p.id">
                      {{ invitandoId() === p.id ? 'Enviando...' : (p.invitacion_enviada ? 'Reenviar invitación' : 'Enviar invitación') }}
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              @if (!cargando()) {
                <tr>
                  <td colspan="5" class="vacio">No hay profesores registrados.</td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin: 1rem 0;
    }
    .file-btn {
      display: inline-block;
      padding: 0.6rem 1.25rem;
      background: #0a2463;
      color: white;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .file-btn input {
      display: none;
    }
    .file-btn:has(input:disabled) {
      background: #ccc;
      cursor: not-allowed;
    }
    .card-resumen {
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .card-resumen.exito {
      background: #d4edda;
      color: #155724;
    }
    .card-resumen.sin-cambios {
      background: #fff3cd;
      color: #856404;
    }
    .errores { color: #dc3545; font-weight: 600; }
    .cargando {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
    .tag-ok, .tag-pendiente, .tag-inactiva {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .tag-ok { background: #d4edda; color: #155724; }
    .tag-pendiente { background: #fff3cd; color: #856404; }
    .tag-inactiva { background: #e9ecef; color: #6c757d; }
    .btn-invitar {
      padding: 0.4rem 0.8rem;
      background: #3da5d9;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-invitar:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `],
})
export class ProfesoresComponent {
  private profesorService = inject(ProfesorService);
  private feedback = inject(FeedbackService);

  profesores = signal<Profesor[]>([]);
  cargando = signal(false);
  importando = signal(false);
  invitandoId = signal<string | null>(null);
  resultadoImportacion = signal<{ creados: number; duplicados: number; errores: string[] } | null>(null);

  constructor() {
    this.cargarProfesores();
  }

  cargarProfesores(): void {
    this.cargando.set(true);
    this.profesorService.listar().subscribe({
      next: (data) => {
        this.profesores.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.feedback.show('Error al cargar profesores.', 'error');
        this.cargando.set(false);
      },
    });
  }

  importarExcel(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.importando.set(true);
    this.resultadoImportacion.set(null);

    this.profesorService.importarExcel(archivo).subscribe({
      next: (r) => {
        this.resultadoImportacion.set(r);
        this.importando.set(false);
        this.cargarProfesores();
        input.value = '';
      },
      error: (err) => {
        const msg = err.error?.error || 'Error al importar.';
        this.feedback.show(msg, 'error');
        this.importando.set(false);
        input.value = '';
      },
    });
  }

  invitar(profesor: Profesor): void {
    this.invitandoId.set(profesor.id);
    this.profesorService.invitar(profesor.id).subscribe({
      next: (r) => {
        this.feedback.show(`Invitación enviada a ${profesor.email}`);
        this.invitandoId.set(null);
        this.cargarProfesores();
      },
      error: (err) => {
        const msg = err.error?.error || 'Error al enviar invitación.';
        this.feedback.show(msg, 'error');
        this.invitandoId.set(null);
      },
    });
  }
}
