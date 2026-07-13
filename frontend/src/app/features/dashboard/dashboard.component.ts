import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { EgresadosService } from '../../services/egresados.service';
import { Ciudad } from '../../models/ciudad.model';
import { Egresado } from '../../models/egresado.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

interface CityStat {
  nombre: string;
  count: number;
  porcentaje: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent],
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
  `],
  template: `
    <div class="dashboard-header">
      <h2>Dashboard</h2>
      <p>Indicadores clave del sistema de egresados</p>
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
  `
})
export class DashboardComponent implements OnInit {
  private egresadosService = inject(EgresadosService);

  egresados = signal<Egresado[]>([]);
  ciudades = signal<Ciudad[]>([]);

  totalEgresados = computed(() => this.egresados().length);

  tasaEmpleabilidad = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '0%';
    const trabajando = this.egresados().filter(e => e.trabajaActualmente).length;
    return `${((trabajando / total) * 100).toFixed(1)}%`;
  });

  empleabilidadDetalle = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '';
    const trabajando = this.egresados().filter(e => e.trabajaActualmente).length;
    return `${trabajando} de ${total} egresados`;
  });

  egresadosActivos = computed(() => {
    return this.egresados().filter(e => e.trabajaActualmente).length;
  });

  activosDetalle = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '';
    const activos = this.egresadosActivos();
    return `${activos} empleados actualmente`;
  });

  distribucionCiudades = computed<CityStat[]>(() => {
    const conteo = new Map<number, number>();
    this.egresados().forEach(e => {
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

  ngOnInit(): void {
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
    this.egresadosService.getCiudades().subscribe(c => this.ciudades.set(c));
  }
}
