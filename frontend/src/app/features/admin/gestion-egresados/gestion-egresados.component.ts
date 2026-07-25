import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EgresadosService } from '../../../services/egresados.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Egresado } from '../../../models/egresado.model';
import { Programa } from '../../../models/programa.model';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EgresadoModalComponent } from '../../egresados/egresado-modal/egresado-modal.component';

@Component({
  selector: 'app-gestion-egresados',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent, EgresadoModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gestion-egresados.component.html',
  styles: [`
    .importar-section {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .importar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .importar-header h3 {
      font-size: 1.1rem;
      color: #0a2463;
    }

    .btn-importar {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #8e44ad;
      color: #fff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    .btn-importar:hover {
      background: #7d3c98;
    }

    .importar-descripcion {
      color: #555;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .importar-dropzone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .importar-dropzone:hover {
      border-color: #8e44ad;
      background: #f8f0fc;
    }

    .importar-dropzone.arrastrando {
      border-color: #8e44ad;
      background: #f0e6f6;
    }

    .importar-dropzone-texto {
      color: #555;
      font-size: 0.9rem;
    }

    .importar-dropzone-texto strong {
      color: #8e44ad;
    }

    .importar-dropzone-input {
      display: none;
    }

    .archivo-importado {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      padding: 0.75rem 1rem;
      border-radius: 6px;
    }

    .archivo-importado-info {
      flex: 1;
    }

    .archivo-importado-info .nombre {
      font-weight: 600;
      font-size: 0.9rem;
      color: #155724;
    }

    .archivo-importado-info .detalle {
      font-size: 0.8rem;
      color: #155724;
      opacity: 0.8;
    }

    .btn-procesar {
      margin-top: 1rem;
    }

    .btn-quitar-archivo {
      background: transparent;
      color: #c0392b;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.3rem 0.5rem;
    }

    .btn-quitar-archivo:hover {
      text-decoration: underline;
    }

    .formatos-ayuda {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: #888;
    }
  `],
})
export class GestionEgresadosComponent {

  private egresadosService = inject(EgresadosService);
  private feedback = inject(FeedbackService);
  authService = inject(AuthService);

  readonly egresados = signal<Egresado[]>([]);
  readonly programas = signal<Programa[]>([]);
  readonly filtroNombre = signal('');
  readonly filtroPrograma = signal(0);

  readonly egresadoSeleccionado = signal<Egresado | null>(null);
  readonly mostrarModalEdicion = signal(false);
  readonly egresadoPendienteEliminacion = signal<Egresado | null>(null);

  readonly archivoImportacion = signal<File | null>(null);
  readonly arrastrandoImportacion = signal(false);
  readonly importando = signal(false);

  private mapaProgramas = new Map<string, string>();

  readonly egresadosFiltrados = computed(() => this.egresados().filter(e => {
    const consulta = this.filtroNombre().trim().toLocaleLowerCase();
    const nombre = `${e.nombres} ${e.apellidos}`.toLocaleLowerCase();
    if (consulta && !nombre.includes(consulta)) return false;
    if (this.filtroPrograma() && e.idPrograma !== this.filtroPrograma()) return false;
    return true;
  }));

  readonly hayFiltrosActivos = computed(() =>
    Boolean(this.filtroNombre().trim() || this.filtroPrograma())
  );

  ngOnInit(): void {
    this.egresadosService.getProgramas().subscribe(p => {
      this.programas.set(p);
      p.forEach(prog => this.mapaProgramas.set(prog.id, prog.nombre));
    });
    this.egresadosService.getEgresados().subscribe(e => this.egresados.set(e));
  }

  nombrePrograma(id: number): string {
    return this.mapaProgramas.get(String(id)) ?? '—';
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroPrograma.set(0);
  }

  onFiltroPrograma(valor: string | number): void {
    this.filtroPrograma.set(Number(valor));
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
      this.egresados.update(lista => lista.map(e => e.id === egresado.id ? egresado : e));
      this.cerrarModalEdicion();
      this.feedback.show('Egresado actualizado.');
    });
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
      this.egresados.update(lista => lista.filter(e => e.id !== egresado.id));
      this.cancelarEliminacion();
      this.feedback.show('Egresado eliminado.');
    });
  }

  onDragOverImportacion(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoImportacion.set(true);
  }

  onDragLeaveImportacion(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoImportacion.set(false);
  }

  onDropImportacion(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrandoImportacion.set(false);
    const archivos = event.dataTransfer?.files;
    if (archivos && archivos.length > 0) {
      this.procesarArchivoImportacion(archivos[0]);
    }
  }

  onFileImportacionSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivoImportacion(input.files[0]);
    }
  }

  private procesarArchivoImportacion(archivo: File): void {
    const tiposPermitidos = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const extensionesPermitidas = ['.csv', '.xls', '.xlsx'];
    const extension = '.' + archivo.name.split('.').pop()?.toLowerCase();

    if (!tiposPermitidos.includes(archivo.type) && !extensionesPermitidas.includes(extension)) {
      this.feedback.show('Solo se permiten archivos CSV o Excel (.csv, .xls, .xlsx).', 'error');
      return;
    }

    this.archivoImportacion.set(archivo);
  }

  eliminarArchivoImportacion(): void {
    this.archivoImportacion.set(null);
  }

  procesarImportacion(): void {
    const archivo = this.archivoImportacion();
    if (!archivo) return;

    this.importando.set(true);

    setTimeout(() => {
      this.feedback.show(`Archivo "${archivo.name}" procesado. Los egresados serán importados cuando los datos estén disponibles.`);
      this.archivoImportacion.set(null);
      this.importando.set(false);
    }, 1500);
  }
}
