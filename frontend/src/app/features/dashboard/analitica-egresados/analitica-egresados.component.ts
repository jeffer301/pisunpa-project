import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EgresadosService } from '../../../services/egresados.service';
import { Egresado } from '../../../models/egresado.model';
import { Programa } from '../../../models/programa.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

interface SectorStats {
  nombre: string;
  count: number;
  porcentaje: number;
}

@Component({
  selector: 'app-analitica-egresados',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analitica-egresados.component.html',
  styles: [`
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
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 1.5rem;
    }

    .chart-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #4a5568;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .bar-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .bar-label {
      width: 140px;
      font-size: 0.85rem;
      color: #4a5568;
      text-align: right;
      flex-shrink: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-track {
      flex: 1;
      height: 20px;
      background: #edf2f7;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-fill.programa {
      background: linear-gradient(90deg, #0a2463, #3da5d9);
    }

    .bar-fill.salario {
      background: linear-gradient(90deg, #27ae60, #2ecc71);
    }

    .bar-fill.sector {
      background: linear-gradient(90deg, #8e44ad, #9b59b6);
    }

    .bar-count {
      width: 30px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #0a2463;
    }

    .bar-pct {
      width: 40px;
      font-size: 0.8rem;
      color: #718096;
      text-align: right;
    }

    .empty-state {
      color: #a0aec0;
      font-size: 0.9rem;
      text-align: center;
      padding: 2rem;
    }

    .leyenda-salarios {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: #f7fafc;
      border-radius: 6px;
      font-size: 0.8rem;
      color: #718096;
      line-height: 1.5;
    }

    .leyenda-salarios strong {
      color: #4a5568;
    }
  `],
})
export class AnaliticaEgresadosComponent implements OnInit {

  private egresadosService = inject(EgresadosService);

  readonly egresados = signal<Egresado[]>([]);
  readonly programas = signal<Programa[]>([]);

  readonly totalEgresados = computed(() => this.egresados().length);

  readonly tasaEmpleabilidad = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '0%';
    const trabajando = this.egresados().filter(e => e.trabaja_actualmente).length;
    return `${((trabajando / total) * 100).toFixed(1)}%`;
  });

  readonly empleabilidadDetalle = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '';
    const trabajando = this.egresados().filter(e => e.trabaja_actualmente).length;
    return `${trabajando} de ${total} egresados`;
  });

  readonly tasaNoEmpleo = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '0%';
    const sinEmpleo = this.egresados().filter(e => !e.trabaja_actualmente).length;
    return `${((sinEmpleo / total) * 100).toFixed(1)}%`;
  });

  readonly noEmpleoDetalle = computed(() => {
    const total = this.egresados().length;
    if (total === 0) return '';
    const sinEmpleo = this.egresados().filter(e => !e.trabaja_actualmente).length;
    return `${sinEmpleo} egresados sin empleo`;
  });

  readonly distribucionProgramas = computed<SectorStats[]>(() => {
    const conteo = new Map<string, number>();
    this.egresados().forEach(e => {
      if (e.programa?.id) {
        conteo.set(e.programa.id, (conteo.get(e.programa.id) || 0) + 1);
      }
    });
    const maxCount = Math.max(...[...conteo.values()], 1);
    return [...conteo.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        nombre: this.programas().find(p => p.id === id)?.nombre ?? 'Desconocido',
        count,
        porcentaje: (count / maxCount) * 100,
      }));
  });

  readonly sectoresLaborales = computed<SectorStats[]>(() => {
    const sectores: Record<string, number> = {
      'Tecnología': 0,
      'Salud': 0,
      'Educación': 0,
      'Finanzas': 0,
      'Construcción': 0,
      'Otros': 0,
    };

    this.egresados().filter(e => e.trabaja_actualmente).forEach(e => {
      sectores['Otros']++;
    });

    const maxCount = Math.max(...Object.values(sectores), 1);
    return Object.entries(sectores)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([nombre, count]) => ({
        nombre,
        count,
        porcentaje: (count / maxCount) * 100,
      }));
  });

  readonly rangosSalariales = computed<SectorStats[]>(() => {
    const rangos: Record<string, number> = {};

    this.egresados().filter(e => e.trabaja_actualmente).forEach(e => {
      const exp = e.experiencias?.find(x => x.cargo_actual);
      const rango = exp?.rango_salarial || 'No especificado';
      rangos[rango] = (rangos[rango] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(rangos), 1);
    return Object.entries(rangos)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({
        nombre: label,
        count,
        porcentaje: (count / maxCount) * 100,
      }));
  });

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => this.programas.set(p));
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
  }
}
