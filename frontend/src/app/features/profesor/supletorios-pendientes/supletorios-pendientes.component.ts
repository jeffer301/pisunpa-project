import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { SupletorioService, SupletorioPendiente } from '../../../services/supletorio.service';

@Component({
  selector: 'app-supletorios-pendientes',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <h1>Supletorios Pendientes</h1>
      <p class="subtitle">Exámenes listos para ser aplicados. Marca como "Realizado" cuando el estudiante presente el supletorio.</p>

      @if (pendientes().length === 0) {
        <div class="empty-state">
          <p>No hay supletorios pendientes por ahora.</p>
        </div>
      } @else {
        <div class="supletorios-grid">
          @for (supletorio of pendientes(); track supletorio.id) {
            <div class="supletorio-card">
              <div class="card-header">
                <span class="badge-estado {{ supletorio.estado }}">
                  {{ supletorio.estado === 'listo' ? 'Listo para aplicar' : 'Realizado' }}
                </span>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <span class="label">Estudiante:</span>
                  <span class="value">{{ supletorio.estudiante }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Programa:</span>
                  <span class="value">{{ supletorio.programa }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Asignatura:</span>
                  <span class="value">{{ supletorio.asignatura }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Grupo:</span>
                  <span class="value">{{ supletorio.grupo }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha del parcial:</span>
                  <span class="value">{{ supletorio.fechaParcial }}</span>
                </div>
              </div>
              @if (supletorio.estado === 'listo') {
                <div class="card-actions">
                  <button class="btn-realizado" (click)="confirmarRealizado(supletorio)">
                    Marcar como Realizado
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (supletorioPendiente()) {
        <app-confirm-dialog
          [titulo]="'Confirmar realización'"
          [mensaje]="'¿Marcar el supletorio de ' + supletorioPendiente()!.estudiante + ' como realizado?'"
          [confirmarLabel]="'Marcar Realizado'"
          (confirmado)="marcarRealizado()"
          (cancelado)="cancelarRealizado()"
        />
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    h1 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 0.3rem;
    }

    .subtitle {
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f8f9fa;
      border-radius: 10px;
      color: #666;
    }

    .supletorios-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .supletorio-card {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .supletorio-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      padding: 0.8rem 1rem;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .badge-estado {
      padding: 0.25rem 0.7rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .badge-estado.listo {
      background: #d4edda;
      color: #155724;
    }

    .badge-estado.realizado {
      background: #cce5ff;
      color: #004085;
    }

    .card-body {
      padding: 1rem;
    }

    .info-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
      font-size: 0.9rem;
    }

    .label {
      color: #666;
      min-width: 130px;
    }

    .value {
      color: #333;
      font-weight: 500;
    }

    .card-actions {
      padding: 0.8rem 1rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
    }

    .btn-realizado {
      background: #27ae60;
      color: #fff;
      padding: 0.45rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-realizado:hover {
      background: #219a52;
    }
  `],
})
export class SupletoriosPendientesComponent {

  private readonly feedbackService = inject(FeedbackService);

  private supletorioService = inject(SupletorioService); 

  readonly supletorioPendiente = signal<SupletorioPendiente | null>(null);

  /*
  readonly solicitudes = signal<SupletorioPendiente[]>([
    {
      id: 1, estudiante: 'Luis Rodríguez Pérez', programa: 'Derecho',
      asignatura: 'D Constitucional', grupo: 'B', fechaParcial: '2026-07-08',
      estado: 'listo',
    },
    {
      id: 2, estudiante: 'Camila Torres Ruiz', programa: 'Administración de Empresas',
      asignatura: 'Contabilidad General', grupo: 'A', fechaParcial: '2026-07-12',
      estado: 'listo',
    },
  ]); */

   readonly solicitudes = signal<SupletorioPendiente[]>([]); // ya no hardcodeado

  readonly pendientes = computed(() =>
    this.solicitudes().filter(s => s.estado === 'listo')
  );

   ngOnInit(): void {
    this.supletorioService.getPendientes().subscribe({
      next: (data) => this.solicitudes.set(data),
      error: (err) => {
        this.feedbackService.show('No se pudieron cargar los pendientes.', 'error');
        console.error(err);
      }
    });
  }

 


  confirmarRealizado(supletorio: SupletorioPendiente): void {
    this.supletorioPendiente.set(supletorio);
  }

  cancelarRealizado(): void {
    this.supletorioPendiente.set(null);
  }

   marcarRealizado(): void {
    const supletorio = this.supletorioPendiente();
    if (!supletorio) return;

    this.supletorioService.marcarRealizado(supletorio.id).subscribe({
      next: (actualizado) => {
        this.solicitudes.update(lista =>
          lista.map(s => s.id === actualizado.id ? actualizado : s)
        );
        this.feedbackService.show(`Supletorio de ${actualizado.estudiante} marcado como realizado.`);
        this.cancelarRealizado();
      },
      error: (err) => {
        this.feedbackService.show('No se pudo marcar como realizado.', 'error');
        console.error(err);
      }
    });
  }
}
