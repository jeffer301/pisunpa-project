import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EgresadosService } from '../../services/egresados.service';
import { AuthService } from '../../core/auth/auth.service';
import { Egresado } from '../../models/egresado.model';
import { Programa } from '../../models/programa.model';
import { Departamento } from '../../models/departamento.model';
import { Ciudad } from '../../models/ciudad.model';

@Component({
  selector: 'app-egresados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './egresados.component.html',
})
export class EgresadosComponent implements OnInit {
  private egresadosService = inject(EgresadosService);
  authService = inject(AuthService);

  egresados = signal<Egresado[]>([]);
  egresadosFiltrados = signal<Egresado[]>([]);
  programas = signal<Programa[]>([]);
  departamentos = signal<Departamento[]>([]);
  ciudades = signal<Ciudad[]>([]);

  filtroNombre = signal('');
  filtroPrograma = signal(0);
  filtroLaboral = signal<'todos' | 'trabaja' | 'no_trabaja'>('todos');

  private mapaProgramas = new Map<number, string>();
  private mapaCiudades = new Map<number, string>();
  private mapaDepartamentos = new Map<number, string>();

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => {
      this.programas.set(p);
      p.forEach(prog => this.mapaProgramas.set(prog.id, prog.nombre));
    });
    this.egresadosService.getDepartamentos().subscribe(d => {
      this.departamentos.set(d);
      d.forEach(dep => this.mapaDepartamentos.set(dep.id, dep.nombre));
    });
    this.egresadosService.getCiudades().subscribe(c => {
      this.ciudades.set(c);
      c.forEach(ciudad => this.mapaCiudades.set(ciudad.id, ciudad.nombre));
    });
    this.egresadosService.getEgresados().subscribe(e => {
      this.egresados.set(e);
      this.egresadosFiltrados.set([...e]);
    });
  }

  nombrePrograma(id: number): string {
    return this.mapaProgramas.get(id) ?? '—';
  }

  nombreCiudad(id: number): string {
    return this.mapaCiudades.get(id) ?? '—';
  }

  nombreDepartamento(id: number): string {
    return this.mapaDepartamentos.get(id) ?? '—';
  }

  onFiltroNombre(valor: string): void {
    this.filtroNombre.set(valor);
    this.aplicarFiltros();
  }

  onFiltroPrograma(valor: number): void {
    this.filtroPrograma.set(Number(valor));
    this.aplicarFiltros();
  }

  onFiltroLaboral(valor: string): void {
    this.filtroLaboral.set(valor as 'todos' | 'trabaja' | 'no_trabaja');
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = [...this.egresados()];
    const nombre = this.filtroNombre();
    const programa = this.filtroPrograma();
    const laboral = this.filtroLaboral();

    if (nombre.trim()) {
      const busqueda = nombre.toLowerCase();
      resultado = resultado.filter(e =>
        e.nombres.toLowerCase().includes(busqueda) ||
        e.apellidos.toLowerCase().includes(busqueda)
      );
    }

    if (programa) {
      resultado = resultado.filter(e => e.idPrograma === programa);
    }

    if (laboral === 'trabaja') {
      resultado = resultado.filter(e => e.trabajaActualmente);
    } else if (laboral === 'no_trabaja') {
      resultado = resultado.filter(e => !e.trabajaActualmente);
    }

    this.egresadosFiltrados.set(resultado);
  }

  eliminar(id: number): void {
    this.egresadosService.eliminarEgresado(id).subscribe(() => {
      this.egresados.update(list => list.filter(e => e.id !== id));
      this.aplicarFiltros();
    });
  }
}
