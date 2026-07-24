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
  readonly filtroPrograma = signal('');
  readonly filtroLaboral = signal<'todos' | 'trabaja' | 'no_trabaja'>('todos');
  readonly filtroPendiente = signal<'ninguno' | 'sin-empleo' | 'sin-empresa'>('ninguno');

  readonly egresadoSeleccionado = signal<Egresado | null>(null);
  readonly mostrarModalEdicion = signal(false);
  readonly egresadoPendienteEliminacion = signal<Egresado | null>(null);

  readonly egresadosFiltrados = computed(() => this.egresados().filter((egresado) => {
    const consulta = this.filtroNombre().trim().toLocaleLowerCase();
    const nombre = `${egresado.usuario?.first_name ?? ''} ${egresado.usuario?.last_name ?? ''}`.toLocaleLowerCase();
    if (consulta && !nombre.includes(consulta)) return false;
    if (this.filtroPrograma() && egresado.programa?.id !== this.filtroPrograma()) return false;
    if (this.filtroLaboral() === 'trabaja' && !egresado.trabaja_actualmente) return false;
    if (this.filtroLaboral() === 'no_trabaja' && egresado.trabaja_actualmente) return false;
    return true;
  }));

  readonly hayFiltrosActivos = computed(() => Boolean(
    this.filtroNombre().trim() || this.filtroPrograma() || this.filtroLaboral() !== 'todos' || this.filtroPendiente() !== 'ninguno'
  ));

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => this.programas.set(p));
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos.set(d));
    this.egresadosService.getCiudades().subscribe(c => this.ciudades.set(c));
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
    this.route.queryParamMap.subscribe(params => {
      const pendiente = params.get('pendiente');
      this.filtroPendiente.set(pendiente === 'sin-empleo' || pendiente === 'sin-empresa' ? pendiente : 'ninguno');
    });
  }

  onFiltroNombre(valor: string): void {
    this.filtroNombre.set(valor);
  }

  onFiltroPrograma(valor: string | number): void {
    this.filtroPrograma.set(String(valor));
  }

  onFiltroLaboral(valor: string): void {
    this.filtroLaboral.set(valor as 'todos' | 'trabaja' | 'no_trabaja');
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroPrograma.set('');
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
    this.egresadosService.actualizarEgresado(egresado.id, egresado).subscribe(() => {
      this.egresados.update(list =>
        list.map(e => e.id === egresado.id ? egresado : e)
      );
      this.cerrarModalEdicion();
      this.feedback.show('Egresado actualizado.');
    });
  }
}
