import { Component, OnInit, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SupletorioService } from '../../../services/supletorio.service';
import { SolicitudSupletorio } from '../../../models/supletorio.model';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export type EstadoPago = 'pendiente' | 'comprobante_subido' | 'pagado';

@Component({
  selector: 'app-bandeja-supletorios',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bandeja-supletorios.component.html',
  styles: [`
    .estado-badge-solicitud {
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .estado-badge-solicitud.pendiente {
      background: #fff3cd;
      color: #856404;
    }

    .estado-badge-solicitud.aprobada {
      background: #d4edda;
      color: #155724;
    }

    .estado-badge-solicitud.rechazada {
      background: #f8d7da;
      color: #721c24;
    }

    .estado-badge-pago {
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .estado-badge-pago.pendiente {
      background: #f8d7da;
      color: #721c24;
    }

    .estado-badge-pago.comprobante_subido {
      background: #fff3cd;
      color: #856404;
    }

    .estado-badge-pago.pagado {
      background: #d4edda;
      color: #155724;
    }

    .btn-aprobar {
      background: #27ae60;
      color: #fff;
      padding: 0.3rem 0.7rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .btn-aprobar:hover {
      background: #219a52;
    }

    .btn-rechazar {
      background: #e74c3c;
      color: #fff;
      padding: 0.3rem 0.7rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .btn-rechazar:hover {
      background: #c0392b;
    }

    .btn-confirmar-pago {
      background: #2980b9;
      color: #fff;
      padding: 0.3rem 0.7rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .btn-confirmar-pago:hover {
      background: #2471a3;
    }

    .btn-ver-soporte {
      background: #8e44ad;
      color: #fff;
      padding: 0.3rem 0.7rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .btn-ver-soporte:hover {
      background: #7d3c98;
    }

    .btn-anexo {
      display: block;
      margin-bottom: 0.3rem;
    }

    .acciones-solicitud {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .sin-archivo {
      color: #999;
      font-size: 0.85rem;
    }

    .mensaje-vacio {
      text-align: center;
      padding: 2rem;
      color: #718096;
      background: #f7fafc;
      border-radius: 8px;
    }

    @keyframes highlightFade {
      0% { background-color: #fff3cd; }
      100% { background-color: transparent; }
    }

    tr.highlight {
      animation: highlightFade 3s ease-out;
    }
  `],
})
export class BandejaSupletoriosComponent implements OnInit {

  private supletorioService = inject(SupletorioService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  readonly feedbackService = inject(FeedbackService);

  readonly esEscritura = computed(() => this.authService.esAdminEscritura());

  readonly filtroBusqueda = signal('');
  readonly filtroEstadoSolicitud = signal<'todos' | EstadoSolicitud>('todos');
  readonly filtroEstadoPago = signal<'todos' | EstadoPago>('todos');
  readonly solicitudPendienteAccion = signal<{ solicitud: SolicitudSupletorio; accion: 'aprobar' | 'rechazar' } | null>(null);
  readonly solicitudPendientePago = signal<SolicitudSupletorio | null>(null);

  readonly solicitudes = signal<SolicitudSupletorio[]>([]);
  readonly cargando = signal(true);

  readonly solicitudesFiltradas = computed(() => this.solicitudes().filter(s => {
    const consulta = this.filtroBusqueda().trim().toLocaleLowerCase();
    const coincideBusqueda = !consulta ||
      s.estudiante.toLocaleLowerCase().includes(consulta) ||
      s.asignatura.toLocaleLowerCase().includes(consulta) ||
      s.profesor.toLocaleLowerCase().includes(consulta);
    const coincideEstado = this.filtroEstadoSolicitud() === 'todos' || s.estadoSolicitud === this.filtroEstadoSolicitud();
    const coincidePago = this.filtroEstadoPago() === 'todos' || s.estadoPago === this.filtroEstadoPago();
    return coincideBusqueda && coincideEstado && coincidePago;
  }));

  readonly hayFiltrosActivos = computed(() =>
    Boolean(this.filtroBusqueda().trim() || this.filtroEstadoSolicitud() !== 'todos' || this.filtroEstadoPago() !== 'todos')
  );

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.supletorioService.getMisSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes.set(solicitudes);
        this.cargando.set(false);
        this.resaltarSiEsNecesario();
      },
      error: () => {
        this.cargando.set(false);
        this.feedbackService.show('Error al cargar las solicitudes.', 'error');
      },
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

  limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroEstadoSolicitud.set('todos');
    this.filtroEstadoPago.set('todos');
  }

  solicitarAccion(solicitud: SolicitudSupletorio, accion: 'aprobar' | 'rechazar'): void {
    this.solicitudPendienteAccion.set({ solicitud, accion });
  }

  cancelarAccion(): void {
    this.solicitudPendienteAccion.set(null);
  }

  confirmarAccion(): void {
    const pendiente = this.solicitudPendienteAccion();
    if (!pendiente) return;

    const accion$ = pendiente.accion === 'aprobar'
      ? this.supletorioService.aprobarSupletorio(pendiente.solicitud.id)
      : this.supletorioService.rechazarSupletorio(pendiente.solicitud.id);

    accion$.subscribe({
      next: () => {
        const nuevoEstado: EstadoSolicitud = pendiente.accion === 'aprobar' ? 'aprobada' : 'rechazada';
        this.solicitudes.update(lista =>
          lista.map(s => s.id === pendiente.solicitud.id ? { ...s, estadoSolicitud: nuevoEstado } : s)
        );
        this.feedbackService.show(`Solicitud ${nuevoEstado}.`);
        this.cancelarAccion();
      },
      error: () => {
        this.feedbackService.show('Error al procesar la acción. Intente de nuevo.', 'error');
        this.cancelarAccion();
      },
    });
  }

  solicitarConfirmarPago(solicitud: SolicitudSupletorio): void {
    this.solicitudPendientePago.set(solicitud);
  }

  cancelarConfirmarPago(): void {
    this.solicitudPendientePago.set(null);
  }

  confirmarPago(): void {
    const solicitud = this.solicitudPendientePago();
    if (!solicitud) return;

    this.supletorioService.confirmarPago(solicitud.id).subscribe({
      next: () => {
        this.solicitudes.update(lista =>
          lista.map(s => s.id === solicitud.id ? { ...s, estadoPago: 'pagado' } : s)
        );
        this.feedbackService.show('Pago confirmado.');
        this.cancelarConfirmarPago();
      },
      error: () => {
        this.feedbackService.show('Error al confirmar el pago. Intente de nuevo.', 'error');
        this.cancelarConfirmarPago();
      },
    });
  }

  textoAccionAprobarRechazar(): { titulo: string; mensaje: string } {
    const pendiente = this.solicitudPendienteAccion();
    if (!pendiente) return { titulo: '', mensaje: '' };
    const accion = pendiente.accion === 'aprobar' ? 'aprobar' : 'rechazar';
    return {
      titulo: `${accion.charAt(0).toUpperCase() + accion.slice(1)} solicitud`,
      mensaje: `Se ${accion}rá la solicitud de supletorio de ${pendiente.solicitud.estudiante}.`,
    };
  }
}
