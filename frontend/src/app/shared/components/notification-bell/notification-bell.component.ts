import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  template: `
    <div class="notif-wrapper">
      <button class="notif-bell" (click)="togglePanel()" aria-label="Notificaciones">
        <svg class="bell-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        @if (notifService.tieneNoLeidas()) {
          <span class="notif-badge">{{ notifService.noLeidas() }}</span>
        }
      </button>

      @if (panelAbierto()) {
        <div class="notif-panel">
          <div class="notif-header">
            <span>Notificaciones</span>
            @if (notifService.noLeidas() > 0) {
              <button class="notif-mark-all" (click)="marcarTodasLeidas()">
                Marcar todas como leídas
              </button>
            }
          </div>
          <div class="notif-list">
            @for (n of notifService.notificaciones(); track n.id) {
              <div class="notif-item" [class.no-leida]="!n.leido"
                   (click)="onNotificacionClick(n)">
                <div class="notif-tipo">{{ iconoTipo(n.tipo) }}</div>
                <div class="notif-body">
                  <div class="notif-titulo">{{ n.titulo }}</div>
                  <div class="notif-mensaje">{{ n.mensaje }}</div>
                  <div class="notif-tiempo">{{ tiempoRelativo(n.creado_en) }}</div>
                </div>
              </div>
            } @empty {
              <div class="notif-empty">No hay notificaciones</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-wrapper { position: relative; }
    .notif-bell {
      background: none; border: none; cursor: pointer;
      font-size: 1.3rem; position: relative; padding: 4px 8px;
      color: #fff; display: flex; align-items: center;
    }
    .bell-icon { display: block; }
    .notif-badge {
      position: absolute; top: 0; right: 0;
      background: #e74c3c; color: white; border-radius: 50%;
      font-size: 0.65rem; font-weight: 700;
      min-width: 16px; height: 16px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 4px;
    }
    .notif-panel {
      position: absolute; top: 100%; right: 0;
      width: 360px; max-height: 420px;
      background: white; border: 1px solid #ddd;
      border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      z-index: 1000; overflow: hidden;
    }
    .notif-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; border-bottom: 1px solid #eee;
      font-weight: 600; font-size: 0.9rem;
    }
    .notif-mark-all {
      background: none; border: none; color: var(--color-accent, #3da5d9);
      cursor: pointer; font-size: 0.75rem;
    }
    .notif-list { max-height: 360px; overflow-y: auto; }
    .notif-item {
      display: flex; gap: 10px; padding: 10px 16px;
      cursor: pointer; transition: background 0.15s;
      border-bottom: 1px solid #f5f5f5;
    }
    .notif-item:hover { background: #f9f9f9; }
    .notif-item.no-leida { background: #f0f7ff; }
    .notif-tipo { font-size: 1.2rem; flex-shrink: 0; padding-top: 2px; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-titulo { font-weight: 600; font-size: 0.8rem; margin-bottom: 2px; color: #1a202c; }
    .notif-mensaje { font-size: 0.75rem; color: #666; line-height: 1.3; }
    .notif-tiempo { font-size: 0.65rem; color: #999; margin-top: 3px; }
    .notif-empty { padding: 24px; text-align: center; color: #999; font-size: 0.85rem; }
  `],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifService = inject(NotificationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  panelAbierto = signal(false);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.notifService.contarNoLeidas();
    this.refreshInterval = setInterval(() => {
      this.notifService.contarNoLeidas();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.panelAbierto.set(false);
    }
  }

  togglePanel(): void {
    const next = !this.panelAbierto();
    this.panelAbierto.set(next);
    if (next) {
      this.notifService.cargarNotificaciones();
    }
  }

  onNotificacionClick(notif: import('../../../models/notificacion.model').Notificacion): void {
    if (!notif.leido) {
      this.notifService.marcarLeida(notif.id);
    }
    this.panelAbierto.set(false);
    const ruta = this.rutaParaNotificacion(notif);
    const queryParams = notif.supletorio_id ? { highlight: notif.supletorio_id } : {};
    this.router.navigate([ruta], { queryParams });
  }

  private rutaParaNotificacion(notif: import('../../../models/notificacion.model').Notificacion): string {
    const rol = this.authService.rolActual();
    if (!rol) return '/';
    if (rol === 'administrador' || rol === 'director') {
      return '/admin/bandeja-supletorios';
    }
    if (rol === 'profesor') {
      return '/profesor/supletorios-pendientes';
    }
    return '/estudiante/pago-supletorio';
  }

  marcarTodasLeidas(): void {
    this.notifService.marcarTodasLeidas();
  }

  iconoTipo(tipo: string): string {
    const iconos: Record<string, string> = {
      solicitud_creada: '\u{1F4DD}',
      solicitud_aprobada: '\u{2705}',
      solicitud_rechazada: '\u{274C}',
      pago_confirmado: '\u{1F4B3}',
      examen_agendado: '\u{1F4C5}',
      examen_calificado: '\u{1F4DD}',
    };
    return iconos[tipo] || '\u{1F514}';
  }

  tiempoRelativo(fecha: string): string {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }
}
