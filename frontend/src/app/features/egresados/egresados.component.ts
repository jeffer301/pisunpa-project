import { Component, ChangeDetectionStrategy, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EgresadosService } from '../../services/egresados.service';
import { AuthService } from '../../core/auth/auth.service';
import { Egresado } from '../../models/egresado.model';
import { Programa } from '../../models/programa.model';
import { Departamento } from '../../models/departamento.model';
import { Ciudad } from '../../models/ciudad.model';
import { EgresadoModalComponent } from './egresado-modal/egresado-modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-egresados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EgresadoModalComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './egresados.component.html',
})
export class EgresadosComponent implements OnInit {
  private egresadosService = inject(EgresadosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feedback = inject(FeedbackService);
  authService = inject(AuthService);

  readonly egresados = signal<Egresado[]>([]);
  readonly programas = signal<Programa[]>([]);
  readonly departamentos = signal<Departamento[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);

  readonly filtroNombre = signal('');
  readonly filtroPrograma = signal(0);
  readonly filtroLaboral = signal<'todos' | 'trabaja' | 'no_trabaja'>('todos');
  readonly filtroPendiente = signal<'ninguno' | 'sin-empleo' | 'sin-empresa'>('ninguno');

  readonly egresadoSeleccionado = signal<Egresado | null>(null);
  readonly mostrarModalEdicion = signal(false);
  readonly egresadoPendienteEliminacion = signal<Egresado | null>(null);

  readonly egresadosFiltrados = computed(() => this.egresados().filter((egresado) => {
    const consulta = this.filtroNombre().trim().toLocaleLowerCase();
    const nombre = `${egresado.nombres} ${egresado.apellidos}`.toLocaleLowerCase();
    if (consulta && !nombre.includes(consulta)) return false;
    if (this.filtroPrograma() && egresado.idPrograma !== this.filtroPrograma()) return false;
    if (this.filtroLaboral() === 'trabaja' && !egresado.trabajaActualmente) return false;
    if (this.filtroLaboral() === 'no_trabaja' && egresado.trabajaActualmente) return false;
    if (this.filtroPendiente() === 'sin-empleo') return !egresado.trabajaActualmente;
    if (this.filtroPendiente() === 'sin-empresa') return egresado.trabajaActualmente && !egresado.empresa.trim();
    return true;
  }));

  readonly hayFiltrosActivos = computed(() => Boolean(
    this.filtroNombre().trim() || this.filtroPrograma() || this.filtroLaboral() !== 'todos' || this.filtroPendiente() !== 'ninguno'
  ));

  private mapaProgramas = new Map<string, string>();
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
    });
    this.route.queryParamMap.subscribe(params => {
      const pendiente = params.get('pendiente');
      this.filtroPendiente.set(pendiente === 'sin-empleo' || pendiente === 'sin-empresa' ? pendiente : 'ninguno');
    });
  }

  nombrePrograma(id: number): string {
    return this.mapaProgramas.get(String(id)) ?? '—';
  }

  nombreCiudad(id: number): string {
    return this.mapaCiudades.get(id) ?? '—';
  }

  nombreDepartamento(id: number): string {
    return this.mapaDepartamentos.get(id) ?? '—';
  }

  onFiltroNombre(valor: string): void {
    this.filtroNombre.set(valor);
  }

  onFiltroPrograma(valor: string | number): void {
    this.filtroPrograma.set(Number(valor));
  }

  onFiltroLaboral(valor: string): void {
    this.filtroLaboral.set(valor as 'todos' | 'trabaja' | 'no_trabaja');
  }

  aplicarPendiente(pendiente: 'sin-empleo' | 'sin-empresa'): void {
    this.filtroPendiente.set(pendiente);
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroPrograma.set(0);
    this.filtroLaboral.set('todos');
    this.filtroPendiente.set('ninguno');
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  solicitarEliminacion(egresado: Egresado): void {
    this.egresadoPendienteEliminacion.set(egresado);
  }

  cancelarEliminacion(): void {
    this.egresadoPendienteEliminacion.set(null);
  }

  confirmarEliminacion(): void {
    const egresado = this.egresadoPendienteEliminacion();
    if (!egresado) return;
    this.egresadosService.eliminarEgresado(egresado.id).subscribe(() => {
      this.egresados.update(list => list.filter(item => item.id !== egresado.id));
      this.cancelarEliminacion();
      this.feedback.show('Egresado eliminado.');
    });
  }

  abrirEditar(egresado: Egresado): void {
    this.egresadoSeleccionado.set({ ...egresado });
    this.mostrarModalEdicion.set(true);
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion.set(false);
    this.egresadoSeleccionado.set(null);
  }

  onGuardarEdicion(egresado: Egresado): void {
    this.egresadosService.actualizarEgresado(egresado).subscribe(() => {
      this.egresados.update(list =>
        list.map(e => e.id === egresado.id ? egresado : e)
      );
      this.cerrarModalEdicion();
      this.feedback.show('Egresado actualizado.');
    });
  }
}
