import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-estudiantes-pendientes',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Estudiantes Pendientes de Aprobación</h2>

      @if (cargando()) {
        <p class="cargando">Cargando...</p>
      }

      @if (!cargando() && estudiantes().length === 0) {
        <div class="vacio">
          <p>No hay estudiantes pendientes de aprobación.</p>
        </div>
      }

      @if (!cargando() && estudiantes().length > 0) {
        <div class="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Documento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (est of estudiantes(); track est.id) {
                <tr>
                  <td>{{ est.first_name }} {{ est.last_name }}</td>
                  <td>{{ est.email }}</td>
                  <td>{{ est.documento_identidad }}</td>
                  <td class="acciones">
                    <button class="btn-aprobar" (click)="aprobar(est.id)">Aprobar</button>
                    <button class="btn-rechazar" (click)="rechazar(est.id)">Rechazar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .contenedor {
      padding: 1.5rem;
    }
    h2 {
      color: #0a2463;
      margin-bottom: 1rem;
    }
    .cargando {
      color: #666;
      text-align: center;
      padding: 2rem;
    }
    .vacio {
      text-align: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
    .tabla-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #0a2463;
      color: white;
      font-weight: 600;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .acciones {
      display: flex;
      gap: 0.5rem;
    }
    .btn-aprobar {
      padding: 0.4rem 0.8rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-aprobar:hover {
      background: #218838;
    }
    .btn-rechazar {
      padding: 0.4rem 0.8rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-rechazar:hover {
      background: #c82333;
    }
  `]
})
export class EstudiantesPendientesComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  estudiantes = signal<Usuario[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarPendientes();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('pisunpa_access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarPendientes(): void {
    this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios/estudiantes-pendientes/`, {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.estudiantes.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  aprobar(id: number): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/aprobar/`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.estudiantes.update(lista => lista.filter(e => e.id !== id));
      }
    });
  }

  rechazar(id: number): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/rechazar/`, {}, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        this.estudiantes.update(lista => lista.filter(e => e.id !== id));
      }
    });
  }
}
