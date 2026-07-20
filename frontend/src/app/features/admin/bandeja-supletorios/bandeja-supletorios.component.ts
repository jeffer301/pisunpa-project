import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

import { SupletorioService } from '../../../services/supletorio.service';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';
export type EstadoPago = 'pendiente' | 'comprobante_subido' | 'pagado';

export interface SolicitudSupletorio {
  id: number;
  estudiante: string;
  email: string;
  programa: string;
  asignatura: string;
  profesor: string;
  grupo: string;
  descripcion: string;
  fechaParcial: string;
  estadoSolicitud: EstadoSolicitud;
  estadoPago: EstadoPago;
  comprobanteNombre: string | null;
}

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

    .acciones-solicitud {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .sin-archivo {
      color: #999;
      font-size: 0.85rem;
    }
  `],
})
export class BandejaSupletoriosComponent {

  readonly feedbackService = inject(FeedbackService);

  private supletorioService = inject(SupletorioService); // nuevo

  

  readonly filtroBusqueda = signal('');
  readonly filtroEstadoSolicitud = signal<'todos' | EstadoSolicitud>('todos');
  readonly filtroEstadoPago = signal<'todos' | EstadoPago>('todos');
  readonly solicitudPendienteAccion = signal<{ solicitud: SolicitudSupletorio; accion: 'aprobar' | 'rechazar' } | null>(null);
  readonly solicitudPendientePago = signal<SolicitudSupletorio | null>(null);

  /*
  readonly solicitudes = signal<SolicitudSupletorio[]>([
    {
      id: 1, estudiante: 'Ana García López', email: 'ana.garcia@unipacifica.edu.co',
      programa: 'Ingeniería de Sistemas', asignatura: 'Cálculo Integral', profesor: 'Dr. Carlos Méndez',
      grupo: 'A', descripcion: 'No presentó el parcial 2 por razones médicas.', fechaParcial: '2026-07-10',
      estadoSolicitud: 'pendiente', estadoPago: 'pendiente', comprobanteNombre: null,
    },
    {
      id: 2, estudiante: 'Luis Rodríguez Pérez', email: 'luis.rodriguez@unipacifica.edu.co',
      programa: 'Derecho', asignatura: 'D Constitucional', profesor: 'Dra. María Fernanda Rojas',
      grupo: 'B', descripcion: 'Conflicto de horario con examen de otra materia.', fechaParcial: '2026-07-08',
      estadoSolicitud: 'aprobada', estadoPago: 'comprobante_subido', comprobanteNombre: 'comprobante_pago.pdf',
    },
    {
      id: 3, estudiante: 'Camila Torres Ruiz', email: 'camila.torres@unipacifica.edu.co',
      programa: 'Administración de Empresas', asignatura: 'Contabilidad General', profesor: 'Ing. Roberto Sánchez',
      grupo: 'A', descripcion: 'Solicita supletorio por enfermedad.', fechaParcial: '2026-07-12',
      estadoSolicitud: 'aprobada', estadoPago: 'pagado', comprobanteNombre: 'pago_comprobante.jpg',
    },
    {
      id: 4, estudiante: 'Sebastián Moreno Díaz', email: 'sebastian.moreno@unipacifica.edu.co',
      programa: 'Ingeniería Civil', asignatura: 'Mecánica de Suelos', profesor: 'Dr. Andrés Velasco',
      grupo: 'C', descripcion: 'No asistió por viaje familiar.', fechaParcial: '2026-07-05',
      estadoSolicitud: 'rechazada', estadoPago: 'pendiente', comprobanteNombre: null,
    },
  ]); */


  readonly solicitudes = signal<SolicitudSupletorio[]>([]); // ya no hardcodeado
  
  ngOnInit(): void {
    this.supletorioService.getBandeja().subscribe({
      next: (data) => this.solicitudes.set(data),
      error: (err) => {
        this.feedbackService.show('No se pudieron cargar las solicitudes.', 'error');
        console.error(err);
      }
    });
  }

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
      ? this.supletorioService.aprobar(pendiente.solicitud.id)
      : this.supletorioService.rechazar(pendiente.solicitud.id);

    accion$.subscribe({
      next: (actualizado) => {
        this.solicitudes.update(lista =>
          lista.map(s => s.id === actualizado.id ? actualizado : s)
        );
        this.feedbackService.show(`Solicitud ${actualizado.estadoSolicitud}.`);
        this.cancelarAccion();
      },
      error: (err) => {
        this.feedbackService.show('No se pudo procesar la acción.', 'error');
        console.error(err);
      }
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
      next: (actualizado) => {
        this.solicitudes.update(lista =>
          lista.map(s => s.id === actualizado.id ? actualizado : s)
        );
        this.feedbackService.show('Pago confirmado.');
        this.cancelarConfirmarPago();
      },
      error: (err) => {
        this.feedbackService.show('No se pudo confirmar el pago.', 'error');
        console.error(err);
      }
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
