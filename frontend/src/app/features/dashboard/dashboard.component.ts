import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EgresadosService } from '../../services/egresados.service';
import { AuthService } from '../../core/auth/auth.service';
import { Ciudad } from '../../models/ciudad.model';
import { Egresado } from '../../models/egresado.model';
import { Programa } from '../../models/programa.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

interface CityStat {
  nombre: string;
  count: number;
  porcentaje: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }

    .dashboard-header {
      margin-bottom: 1.5rem;
    }
    .dashboard-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
      color: #1a202c;
    }
    .dashboard-header p {
      color: #718096;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .distribution-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .distribution-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #4a5568;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .city-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .city-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .city-name {
      width: 120px;
      font-size: 0.85rem;
      color: #4a5568;
      text-align: right;
      flex-shrink: 0;
    }

    .city-bar-track {
      flex: 1;
      height: 20px;
      background: #edf2f7;
      border-radius: 4px;
      overflow: hidden;
    }

    .city-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0a2463, #3da5d9);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .city-count {
      width: 30px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0a2463;
    }

    .empty-state {
      color: #a0aec0;
      font-size: 0.9rem;
      text-align: center;
      padding: 2rem;
    }

    .filter-bar {
      margin-top: 0.75rem;
    }

    .filter-bar select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
      background: #fff;
      color: #4a5568;
      cursor: pointer;
    }

    .filter-bar select:focus {
      outline: none;
      border-color: #3da5d9;
      box-shadow: 0 0 0 2px rgba(61, 165, 217, 0.15);
    }

    .pendientes-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pendientes-btn {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      color: #0a2463;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .pendientes-btn:hover {
      border-color: #3da5d9;
      box-shadow: 0 2px 8px rgba(61, 165, 217, 0.12);
    }

    .pendientes-btn:focus-visible {
      outline: 3px solid #005fcc;
      outline-offset: 2px;
    }

    .guest-cta {
      text-align: center;
      padding: 1rem 0;
    }
    .guest-cta p {
      color: #718096;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .cta-btn {
      display: inline-block;
      background: #0a2463;
      color: #fff;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s;
    }
    .cta-btn:hover {
      background: #1a3a7a;
    }
  `],
  template: `
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <p>Indicadores clave del sistema de egresados</p>
      <div class="filter-bar">
        <select (change)="cambiarPrograma($event)">
          <option value="todos">Todos los programas</option>
          @for (p of programas(); track p.id) {
            <option [value]="p.id">{{ p.nombre }}</option>
          }
        </select>
      </div>
    </div>

    <div class="kpi-grid">
      <app-stat-card
        label="Total Egresados"
        [value]="totalEgresados()"
      />
      <app-stat-card
        label="Tasa de Empleabilidad"
        [value]="tasaEmpleabilidad()"
        [subtitle]="empleabilidadDetalle()"
      />
      <app-stat-card
        label="Egresados Activos"
        [value]="egresadosActivos()"
        [subtitle]="activosDetalle()"
      />
    </div>

    <div class="distribution-card">
      <div class="distribution-title">Distribución Geográfica</div>
      @if (distribucionCiudades().length > 0) {
        <div class="city-list">
          @for (ciudad of distribucionCiudades(); track ciudad.nombre) {
            <div class="city-row">
              <span class="city-name">{{ ciudad.nombre }}</span>
              <div class="city-bar-track">
                <div class="city-bar-fill" [style.width.%]="ciudad.porcentaje"></div>
              </div>
              <span class="city-count">{{ ciudad.count }}</span>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">Sin datos disponibles</div>
      }
    </div>

    <div class="distribution-card">
      <div class="distribution-title">Pendientes de gestión</div>
      @if (estaAutenticado()) {
        @if (sinEmpleo() > 0 || sinEmpresa() > 0) {
          <div class="pendientes-list">
            @if (sinEmpleo() > 0) {
              <button class="pendientes-btn" (click)="verPendiente('sin-empleo')">
                {{ sinEmpleo() }} egresados sin empleo actual
              </button>
            }
            @if (sinEmpresa() > 0) {
              <button class="pendientes-btn" (click)="verPendiente('sin-empresa')">
                {{ sinEmpresa() }} egresados sin empresa registrada
              </button>
            }
          </div>
        } @else {
          <div class="empty-state">No hay pendientes de gestión.</div>
        }
      } @else {
        <div class="guest-cta">
          <p>Inicia sesión para gestionar egresados y ver más detalles.</p>
          <a routerLink="/login" class="cta-btn">Iniciar Sesión</a>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private egresadosService = inject(EgresadosService);
  private authService = inject(AuthService);
  private router = inject(Router);

  estaAutenticado = computed(() => this.authService.estaAutenticado);

  egresados = signal<Egresado[]>([]);
  ciudades = signal<Ciudad[]>([]);
  programas = signal<Programa[]>([]);
  programaSeleccionado = signal<number | null>(null);

  egresadosFiltrados = computed(() => {
    const programa = this.programaSeleccionado();
    if (programa === null) return this.egresados();
    return this.egresados().filter(e => e.idPrograma === programa);
  });

  totalEgresados = computed(() => this.egresadosFiltrados().length);

  tasaEmpleabilidad = computed(() => {
    const total = this.egresadosFiltrados().length;
    if (total === 0) return '0%';
    const trabajando = this.egresadosFiltrados().filter(e => e.trabajaActualmente).length;
    return `${((trabajando / total) * 100).toFixed(1)}%`;
  });

  empleabilidadDetalle = computed(() => {
    const total = this.egresadosFiltrados().length;
    if (total === 0) return '';
    const trabajando = this.egresadosFiltrados().filter(e => e.trabajaActualmente).length;
    return `${trabajando} de ${total} egresados`;
  });

  egresadosActivos = computed(() => {
    return this.egresadosFiltrados().filter(e => e.trabajaActualmente).length;
  });

  activosDetalle = computed(() => {
    const total = this.egresadosFiltrados().length;
    if (total === 0) return '';
    const activos = this.egresadosActivos();
    return `${activos} empleados actualmente`;
  });

  distribucionCiudades = computed<CityStat[]>(() => {
    const conteo = new Map<number, number>();
    this.egresadosFiltrados().forEach(e => {
      conteo.set(e.idCiudad, (conteo.get(e.idCiudad) || 0) + 1);
    });

    const ciudadMap = new Map(this.ciudades().map(c => [c.id, c.nombre]));
    const maxCount = Math.max(...[...conteo.values()], 1);

    return [...conteo.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => ({
        nombre: ciudadMap.get(id) ?? 'Desconocido',
        count,
        porcentaje: (count / maxCount) * 100,
      }));
  });

  sinEmpleo = computed(() =>
    this.egresadosFiltrados().filter(e => !e.trabajaActualmente).length
  );

  sinEmpresa = computed(() =>
    this.egresadosFiltrados().filter(e => e.trabajaActualmente && !e.empresa.trim()).length
  );

  verPendiente(pendiente: 'sin-empleo' | 'sin-empresa'): void {
    this.router.navigate(['/egresados'], { queryParams: { pendiente } });
  }

  cambiarPrograma(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.programaSeleccionado.set(value === 'todos' ? null : Number(value));
  }

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => {
      const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const unique = [...new Map(p.map(prog => [normalize(prog.nombre), prog])).values()];
      this.programas.set(unique);
    });
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
    this.egresadosService.getCiudades().subscribe(c => this.ciudades.set(c));
  }
}
