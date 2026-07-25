import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/usuarios/notificaciones`;

  private _notificaciones = signal<Notificacion[]>([]);
  private _noLeidas = signal<number>(0);

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly noLeidas = this._noLeidas.asReadonly();
  readonly tieneNoLeidas = computed(() => this._noLeidas() > 0);

  cargarNotificaciones(): void {
    this.http.get<{ results: Notificacion[] }>(`${this.api}/`)
      .subscribe({
        next: (res) => this._notificaciones.set(res.results),
        error: () => this._notificaciones.set([]),
      });
  }

  contarNoLeidas(): void {
    this.http.get<{ count: number }>(`${this.api}/contar-no-leidas/`)
      .subscribe({
        next: (res) => this._noLeidas.set(res.count),
        error: () => this._noLeidas.set(0),
      });
  }

  marcarLeida(id: string): void {
    this.http.patch(`${this.api}/${id}/leer/`, {})
      .subscribe({
        next: () => {
          this._notificaciones.update(n =>
            n.map(notif => notif.id === id ? { ...notif, leido: true } : notif)
          );
          this._noLeidas.update(c => Math.max(0, c - 1));
        },
      });
  }

  marcarTodasLeidas(): void {
    this.http.post(`${this.api}/leer-todas/`, {})
      .subscribe({
        next: () => {
          this._notificaciones.update(n =>
            n.map(notif => ({ ...notif, leido: true }))
          );
          this._noLeidas.set(0);
        },
      });
  }
}
