import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SolicitudSupletorio, MiSolicitudSupletorio } from '../models/supletorio.model';

@Injectable({ providedIn: 'root' })
export class SupletorioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/supletorios`;

  getMisSolicitudes(): Observable<SolicitudSupletorio[]> {
    return this.http.get<SolicitudSupletorio[]>(`${this.apiUrl}/bandeja/`);
  }

  getMiSolicitudActiva(): Observable<MiSolicitudSupletorio[]> {
    return this.http.get<MiSolicitudSupletorio[]>(`${this.apiUrl}/mis-solicitudes/`);
  }

  crearSolicitud(data: FormData): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/solicitudes/`, data);
  }

  aprobarSupletorio(id: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/bandeja/${id}/aprobar/`, {});
  }

  rechazarSupletorio(id: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/bandeja/${id}/rechazar/`, {});
  }

  confirmarPago(id: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/bandeja/${id}/confirmar-pago/`, {});
  }

  subirComprobantePago(recibo: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('comprobante', recibo);
    return this.http.post(`${this.apiUrl}/pago/comprobante/`, formData);
  }
}
