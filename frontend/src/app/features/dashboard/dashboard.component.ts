import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { EgresadosService } from '../../services/egresados.service';
import { Ciudad } from '../../models/ciudad.model';
import { Egresado } from '../../models/egresado.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

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
    }
    .dashboard-header p {
      color: #666;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
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
        label="Distribución Geográfica"
        value=""
        [subtitle]="distribucionGeografica()"
      />
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

  distribucionGeografica = computed(() => {
    const conteo = new Map<number, number>();
    this.egresados().forEach(e => {
      conteo.set(e.idCiudad, (conteo.get(e.idCiudad) || 0) + 1);
    });

    const ciudadMap = new Map(this.ciudades().map(c => [c.id, c.nombre]));

    const sorted = [...conteo.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return sorted
      .map(([id, count]) => `${ciudadMap.get(id) ?? 'Desconocido'} (${count})`)
      .join(' · ');
  });

  ngOnInit(): void {
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
    this.egresadosService.getCiudades().subscribe(c => this.ciudades.set(c));
  }
}
