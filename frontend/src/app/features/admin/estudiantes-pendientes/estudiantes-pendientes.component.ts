import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
      <h2>Usuarios Pendientes de Aprobación</h2>
      <p class="subtitulo">Solicitudes de registro de estudiantes y egresados pendientes de validación.</p>

      @if (cargando()) {
        <p class="cargando">Cargando...</p>
      }

      @if (!cargando() && usuarios().length === 0) {
        <div class="vacio">
          <p>No hay usuarios pendientes de aprobación.</p>
        </div>
      }

      @if (!cargando() && usuarios().length > 0) {
        <div class="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Documento</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of usuarios(); track u.id) {
                <tr>
                  <td>{{ u.first_name }} {{ u.last_name }}</td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.documento_identidad || u.documento }}</td>
                  <td>
                    <span class="rol-badge" [class]="'rol-' + (u.rol || 'sin-rol')">
                      {{ rolLabel(u.rol) }}
                    </span>
                  </td>
                  <td class="acciones">
                    <button class="btn-aprobar" (click)="aprobar(u.id)">Aprobar</button>
                    <button class="btn-rechazar" (click)="rechazar(u.id)">Rechazar</button>
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
      margin-bottom: 0.25rem;
    }
    .subtitulo {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
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
    .rol-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .rol-estudiante {
      background: #e3f2fd;
      color: #1565c0;
    }
    .rol-egresado {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .rol-profesor {
      background: #fff3e0;
      color: #e65100;
    }
    .rol-sin-rol {
      background: #f5f5f5;
      color: #666;
    }
  `]
})
export class EstudiantesPendientesComponent implements OnInit {
  private http = inject(HttpClient);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);

  ngOnInit(): void {
    this.cargarPendientes();
  }

  rolLabel(rol: string | null): string {
    if (!rol) return 'Sin rol';
    const labels: Record<string, string> = {
      estudiante: 'Estudiante',
      egresado: 'Egresado',
      profesor: 'Docente',
      administrador: 'Administrador',
    };
    return labels[rol] || rol;
  }

  cargarPendientes(): void {
    this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios/estudiantes-pendientes/`).subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  aprobar(id: string): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/aprobar/`, {}).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(u => u.id !== id));
      }
    });
  }

  rechazar(id: string): void {
    this.http.patch(`${environment.apiUrl}/usuarios/usuarios/${id}/rechazar/`, {}).subscribe({
      next: () => {
        this.usuarios.update(lista => lista.filter(u => u.id !== id));
      }
    });
  }
}
