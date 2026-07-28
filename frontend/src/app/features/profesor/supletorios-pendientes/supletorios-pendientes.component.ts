import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SupletorioPendiente } from '../../../models/supletorio.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { diasHabilesEntre, agregarDiasHabiles } from '../../../core/utils/business-days';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supletorios-pendientes',
  standalone: true,
  imports: [ModalComponent, FormsModule],
  template: `
    <section class="page">
      <h1>Supletorios</h1>

      <div class="tabs">
        <button class="tab" [class.active]="pestanaActiva() === 'pendientes'" (click)="cambiarPestana('pendientes')">
          Pendientes
        </button>
        <button class="tab" [class.active]="pestanaActiva() === 'historico'" (click)="cambiarPestana('historico')">
          Histórico
        </button>
      </div>

      @if (loading()) {
        <p>Cargando...</p>
      } @else if (pestanaActiva() === 'pendientes') {
        @if (supletorios().length === 0) {
          <p class="empty">No hay supletorios pendientes.</p>
        } @else {
          <div class="cards">
            @for (s of supletorios(); track s.id) {
              <div class="card" [id]="'supletorio-' + s.id">
                <div class="card-header">
                  <span class="asignatura">{{ s.asignatura }}</span>
                  <span class="badge" [class]="'badge-' + s.estado">{{ s.estado }}</span>
                </div>
                <div class="card-body">
                  <p><strong>Estudiante:</strong> {{ s.estudiante }}</p>
                  <p><strong>Programa:</strong> {{ s.programa }}</p>
                  <p><strong>Grupo:</strong> {{ s.grupo }}</p>
                  <p><strong>Fecha solicitud:</strong> {{ s.fechaSolicitud }}</p>
                  <p><strong>Fecha parcial:</strong> {{ s.fechaParcial }}</p>
                  @if (s.fechaExamen) {
                    <p><strong>Fecha examen:</strong> {{ s.fechaExamen }}</p>
                  }
                  @if (s.nota !== undefined && s.nota !== null) {
                    <p><strong>Nota:</strong> {{ s.nota }}/100</p>
                  }
                </div>
                @if (s.estado === 'listo') {
                  <div class="card-actions">
                    <button class="btn btn-primary" (click)="abrirModalAgendar(s)">Agendar Examen</button>
                  </div>
                }
                @if (s.estado === 'agendado') {
                  <div class="card-actions">
                    <button class="btn btn-primary" (click)="abrirModalCalificar(s)">Calificar</button>
                  </div>
                }
              </div>
            }
          </div>
        }
      } @else {
        @if (historico().length === 0) {
          <p class="empty">No hay supletorios calificados.</p>
        } @else {
          <div class="cards">
            @for (s of historico(); track s.id) {
              <div class="card card-historico">
                <div class="card-header">
                  <span class="asignatura">{{ s.asignatura }}</span>
                  <span class="badge badge-realizado">Calificado</span>
                </div>
                <div class="card-body">
                  <p><strong>Estudiante:</strong> {{ s.estudiante }}</p>
                  <p><strong>Programa:</strong> {{ s.programa }}</p>
                  <p><strong>Grupo:</strong> {{ s.grupo }}</p>
                  <p><strong>Fecha solicitud:</strong> {{ s.fechaSolicitud }}</p>
                  <p><strong>Fecha parcial:</strong> {{ s.fechaParcial }}</p>
                  @if (s.fechaExamen) {
                    <p><strong>Fecha examen:</strong> {{ s.fechaExamen }}</p>
                  }
                  @if (s.nota !== undefined && s.nota !== null) {
                    <div class="nota-final">
                      <span class="nota-label">Nota final:</span>
                      <span class="nota-valor">{{ s.nota }}/100</span>
                    </div>
                  }
                  @if (s.notaObservaciones) {
                    <div class="observaciones">
                      <strong>Observaciones:</strong>
                      <p>{{ s.notaObservaciones }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      }

      @if (modalAgendarAbierto()) {
        <app-modal titulo="Agendar Examen Supletorio" (cerrar)="cerrarModalAgendar()">
          <div class="form-group">
            <label>Fecha del examen</label>
            <input type="date" [(ngModel)]="fechaAgendar" [min]="minFechaAgendar()" [max]="maxFechaAgendar()" />
            @if (errorAgendar()) {
              <p class="error">{{ errorAgendar() }}</p>
            }
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModalAgendar()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarAgendar()" [disabled]="!fechaAgendar">Agendar</button>
          </div>
        </app-modal>
      }

      @if (modalCalificarAbierto()) {
        <app-modal titulo="Calificar Supletorio" (cerrar)="cerrarModalCalificar()">
          <div class="form-group">
            <label>Nota (0-100)</label>
            <input type="number" [(ngModel)]="notaCalificar" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Observaciones (opcional)</label>
            <textarea [(ngModel)]="observacionesCalificar" rows="3"></textarea>
          </div>
          @if (errorCalificar()) {
            <p class="error">{{ errorCalificar() }}</p>
          }
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cerrarModalCalificar()">Cancelar</button>
            <button class="btn btn-primary" (click)="confirmarCalificar()" [disabled]="notaCalificar === null">Calificar</button>
          </div>
        </app-modal>
      }
    </section>
  `,
  styles: [`
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    h1 { color: var(--color-primary, #0a2463); margin-bottom: 20px; }

    .tabs { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
    .tab {
      padding: 10px 24px; border: none; background: transparent; cursor: pointer;
      font-size: 0.9rem; font-weight: 600; color: #666; border-bottom: 2px solid transparent;
      margin-bottom: -2px; transition: all 0.2s;
    }
    .tab:hover { color: var(--color-primary, #0a2463); }
    .tab.active {
      color: var(--color-primary, #0a2463); border-bottom-color: var(--color-primary, #0a2463);
    }

    .cards { display: grid; gap: 16px; }
    .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .card-historico { border-left: 4px solid #27ae60; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .asignatura { font-weight: 700; color: var(--color-primary, #0a2463); }
    .badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .badge-listo { background: #fff3cd; color: #856404; }
    .badge-realizado { background: #d4edda; color: #155724; }
    .badge-agendado { background: #cce5ff; color: #004085; }
    .card-body p { margin: 4px 0; font-size: 0.85rem; }
    .card-actions { margin-top: 12px; display: flex; gap: 8px; }
    .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
    .btn-primary { background: var(--color-primary, #0a2463); color: white; }
    .btn-secondary { background: #e0e0e0; color: #333; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.85rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;
    }
    .error { color: #e74c3c; font-size: 0.8rem; margin-top: 4px; }
    .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
    .empty { color: #999; text-align: center; padding: 40px; }

    .nota-final {
      margin-top: 8px; padding: 8px 12px; background: #d4edda; border-radius: 6px;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .nota-label { font-weight: 600; font-size: 0.85rem; color: #155724; }
    .nota-valor { font-weight: 700; font-size: 1.1rem; color: #155724; }

    .observaciones {
      margin-top: 8px; padding: 8px 12px; background: #f8f9fa; border-radius: 6px;
      border-left: 3px solid #6c757d; font-size: 0.85rem;
    }
    .observaciones p { margin: 4px 0 0; color: #555; }

    @keyframes highlightFade {
      0% { background-color: #fff3cd; }
      100% { background-color: transparent; }
    }

    .card.highlight {
      animation: highlightFade 3s ease-out;
    }
  `],
})
export class SupletoriosPendientesComponent implements OnInit {
  private http = inject(HttpClient);
  private feedback = inject(FeedbackService);
  private route = inject(ActivatedRoute);
  private api = `${environment.apiUrl}/supletorios/pendientes`;

  pestanaActiva = signal<'pendientes' | 'historico'>('pendientes');
  supletorios = signal<SupletorioPendiente[]>([]);
  historico = signal<SupletorioPendiente[]>([]);
  loading = signal(true);

  modalAgendarAbierto = signal(false);
  supletorioSeleccionado = signal<SupletorioPendiente | null>(null);
  fechaAgendar = '';
  errorAgendar = signal('');
  minFechaAgendar = signal('');

  modalCalificarAbierto = signal(false);
  notaCalificar: number | null = null;
  observacionesCalificar = '';
  errorCalificar = signal('');
  maxFechaAgendar = signal('');

  ngOnInit(): void {
    this.cargarSupletorios();
    const hoy = new Date();
    this.minFechaAgendar.set(hoy.toISOString().split('T')[0]);
  }

  cambiarPestana(pestana: 'pendientes' | 'historico'): void {
    this.pestanaActiva.set(pestana);
    if (pestana === 'historico' && this.historico().length === 0 && !this.loading()) {
      this.cargarHistorico();
    }
  }

  cargarSupletorios(): void {
    this.loading.set(true);
    this.http.get<SupletorioPendiente[]>(`${this.api}/`)
      .subscribe({
        next: (data) => {
          this.supletorios.set(data);
          this.loading.set(false);
          this.resaltarSiEsNecesario();
        },
        error: () => { this.loading.set(false); this.feedback.show('Error al cargar supletorios'); },
      });
  }

  cargarHistorico(): void {
    this.loading.set(true);
    this.http.get<SupletorioPendiente[]>(`${this.api}/historico/`)
      .subscribe({
        next: (data) => {
          this.historico.set(data);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.feedback.show('Error al cargar histórico'); },
      });
  }

  private resaltarSiEsNecesario(): void {
    const highlightId = this.route.snapshot.queryParamMap.get('highlight');
    if (!highlightId) return;
    setTimeout(() => {
      const el = document.getElementById('supletorio-' + highlightId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 3500);
      }
    }, 100);
  }

  abrirModalAgendar(s: SupletorioPendiente): void {
    this.supletorioSeleccionado.set(s);
    this.fechaAgendar = '';
    this.errorAgendar.set('');
    const fechaSolicitud = new Date(s.fechaSolicitud);
    const maxFecha = agregarDiasHabiles(fechaSolicitud, 10);
    this.maxFechaAgendar.set(maxFecha.toISOString().split('T')[0]);
    this.modalAgendarAbierto.set(true);
  }

  cerrarModalAgendar(): void {
    this.modalAgendarAbierto.set(false);
    this.supletorioSeleccionado.set(null);
  }

  confirmarAgendar(): void {
    const s = this.supletorioSeleccionado();
    if (!s || !this.fechaAgendar) return;

    const fecha = new Date(this.fechaAgendar);
    const fechaSolicitud = new Date(s.fechaSolicitud);
    const dias = diasHabilesEntre(fechaSolicitud, fecha);
    if (dias > 10) {
      this.errorAgendar.set(`La fecha excede los 10 días hábiles desde la solicitud (${dias} días).`);
      return;
    }
    if (dias < 1) {
      this.errorAgendar.set('La fecha debe ser al menos 1 día hábil después de la solicitud.');
      return;
    }

    const fechaEnvio = this.fechaAgendar;
    const id = s.id;
    this.cerrarModalAgendar();
    this.http.patch(`${this.api}/${id}/agendar/`, {
      fecha_examen_supletorio: fechaEnvio,
    }).subscribe({
      next: () => {
        this.feedback.show('Examen agendado correctamente');
        this.cargarSupletorios();
      },
      error: (err) => {
        this.feedback.show(err.error?.detail || 'Error al agendar', 'error');
      },
    });
  }

  abrirModalCalificar(s: SupletorioPendiente): void {
    this.supletorioSeleccionado.set(s);
    this.notaCalificar = null;
    this.observacionesCalificar = '';
    this.errorCalificar.set('');
    this.modalCalificarAbierto.set(true);
  }

  cerrarModalCalificar(): void {
    this.modalCalificarAbierto.set(false);
    this.supletorioSeleccionado.set(null);
  }

  confirmarCalificar(): void {
    const s = this.supletorioSeleccionado();
    if (!s || this.notaCalificar === null) return;

    const nota = this.notaCalificar;
    const obs = this.observacionesCalificar;
    const id = s.id;
    this.cerrarModalCalificar();
    this.http.patch(`${this.api}/${id}/calificar/`, {
      nota: nota,
      nota_observaciones: obs,
    }).subscribe({
      next: () => {
        this.feedback.show('Supletorio calificado correctamente');
        this.cargarSupletorios();
      },
      error: (err) => {
        this.feedback.show(err.error?.detail || 'Error al calificar', 'error');
      },
    });
  }

}
