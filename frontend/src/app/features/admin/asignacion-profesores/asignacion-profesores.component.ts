import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Asignatura } from '../../../models/asignatura.model';

interface AsignacionProfesor {
  id: string;
  profesor: string;
  profesor_email: string;
  profesor_nombre: string;
  asignatura: string;
  asignatura_nombre: string;
}

interface Profesor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-asignacion-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contenedor">
      <h2>Asignaci&#243;n Profesor - Asignatura</h2>

      <div class="layout">
        <div class="formulario-asignar">
          <h3>Nueva Asignaci&#243;n</h3>

          <div class="campo">
            <label>Asignatura</label>
            <select [(ngModel)]="asignaturaSeleccionada">
              <option [value]="" disabled>Seleccione una asignatura</option>
              @for (a of asignaturas(); track a.id) {
                <option [value]="a.id">{{ a.nombre }}</option>
              }
            </select>
          </div>

          <div class="campo">
            <label>Profesor</label>
            <select [(ngModel)]="profesorSeleccionado" [disabled]="!asignaturaSeleccionada">
              <option [value]="" disabled>Seleccione un profesor</option>
              @for (p of profesores(); track p.id) {
                <option [value]="p.id">{{ p.first_name }} {{ p.last_name }} ({{ p.email }})</option>
              }
            </select>
          </div>

          @if (mensajeExito()) {
            <div class="aviso-exito">{{ mensajeExito() }}</div>
          }
          @if (mensajeError()) {
            <div class="aviso-error">{{ mensajeError() }}</div>
          }

          <button (click)="asignar()" [disabled]="!asignaturaSeleccionada || !profesorSeleccionado || guardando()">
            {{ guardando() ? 'Asignando...' : 'Asignar' }}
          </button>
        </div>

        <div class="lista-asignaciones">
          <h3>Asignaciones Actuales</h3>

          @if (asignaciones().length === 0) {
            <p class="vacio">No hay asignaciones registradas.</p>
          }

          @for (asig of asignaciones(); track asig.id) {
            <div class="asignacion-item">
              <div class="asignacion-info">
                <strong>{{ asig.asignatura_nombre }}</strong>
                <span>{{ asig.profesor_nombre }} ({{ asig.profesor_email }})</span>
              </div>
              <button class="btn-eliminar" (click)="eliminar(asig.id)">Eliminar</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contenedor {
      padding: 1.5rem;
    }
    h2 {
      color: #0a2463;
      margin-bottom: 1.5rem;
    }
    h3 {
      color: #333;
      margin-bottom: 1rem;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
    .campo {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 600;
      color: #333;
    }
    select {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }
    select:focus {
      outline: none;
      border-color: #3da5d9;
    }
    button {
      padding: 0.6rem 1.2rem;
      background: #0a2463;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .aviso-exito {
      background: #d4edda;
      color: #155724;
      padding: 0.5rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .aviso-error {
      background: #f8d7da;
      color: #721c24;
      padding: 0.5rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    .vacio {
      color: #666;
      font-style: italic;
    }
    .asignacion-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }
    .asignacion-info {
      display: flex;
      flex-direction: column;
    }
    .asignacion-info span {
      font-size: 0.85rem;
      color: #666;
    }
    .btn-eliminar {
      padding: 0.4rem 0.8rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-eliminar:hover {
      background: #c82333;
    }
  `]
})
export class AsignacionProfesoresComponent implements OnInit {
  private http = inject(HttpClient);

  asignaturas = signal<Asignatura[]>([]);
  profesores = signal<Profesor[]>([]);
  asignaciones = signal<AsignacionProfesor[]>([]);

  asignaturaSeleccionada = '';
  profesorSeleccionado = '';
  guardando = signal(false);
  mensajeExito = signal('');
  mensajeError = signal('');

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.http.get<Asignatura[]>(`${environment.apiUrl}/egresados/asignaturas/`).subscribe({
      next: (data) => this.asignaturas.set(data)
    });
    this.http.get<Profesor[]>(`${environment.apiUrl}/usuarios/disponibles/`).subscribe({
      next: (data) => this.profesores.set(data)
    });
    this.http.get<AsignacionProfesor[]>(`${environment.apiUrl}/egresados/profesor-asignaturas/`).subscribe({
      next: (data) => this.asignaciones.set(data)
    });
  }

  asignar(): void {
    if (!this.asignaturaSeleccionada || !this.profesorSeleccionado) return;
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.http.post(`${environment.apiUrl}/egresados/profesor-asignaturas/create/`, {
      profesor_id: this.profesorSeleccionado,
      asignatura_id: this.asignaturaSeleccionada,
    }).subscribe({
      next: (data) => {
        this.asignaciones.update(lista => [...lista, data as AsignacionProfesor]);
        this.mensajeExito.set('Asignaci&#243;n creada correctamente');
        this.profesorSeleccionado = '';
        this.guardando.set(false);
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: (err) => {
        const msg = err.error?.detail || 'Error al crear la asignaci&#243;n';
        this.mensajeError.set(msg);
        this.guardando.set(false);
      }
    });
  }

  eliminar(id: string): void {
    this.http.delete(`${environment.apiUrl}/egresados/profesor-asignaturas/${id}/delete/`).subscribe({
      next: () => {
        this.asignaciones.update(lista => lista.filter(a => a.id !== id));
      }
    });
  }
}
