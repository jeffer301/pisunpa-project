import { Component, OnInit, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EgresadosService } from '../../../services/egresados.service';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { Programa } from '../../../models/programa.model';
import { SupletorioService } from '../../../services/supletorio.service';

@Component({
  selector: 'app-solicitud-supletorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solicitud-supletorio.component.html',
  styles: [`
    .aviso-advertencia {
      background: #fff3cd;
      color: #856404;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      border: 1px solid #ffc107;
      font-size: 0.9rem;
    }

    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: inherit;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #0a2463;
      box-shadow: 0 0 0 2px rgba(10, 36, 99, 0.15);
    }

    .lista-archivos {
      list-style: none;
      margin-top: 0.5rem;
      padding: 0;
    }

    .lista-archivos li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.6rem;
      background: #f5f7fb;
      border-radius: 4px;
      margin-bottom: 0.3rem;
      font-size: 0.85rem;
    }

    .btn-quitar {
      background: transparent;
      color: #c0392b;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.2rem 0.4rem;
    }

    .btn-quitar:hover {
      text-decoration: underline;
    }
  `],
})
export class SolicitudSupletorioComponent implements OnInit {

  private fb = inject(FormBuilder);
  private egresadosService = inject(EgresadosService);
  private feedbackService = inject(FeedbackService);

  private supletorioService = inject(SupletorioService);

  formulario!: FormGroup;
  programas: Programa[] = [];
  guardando = signal(false);
  archivosSeleccionados = signal<File[]>([]);
  fechaActual = signal(new Date());

  readonly diasLimite = 5;

  excedeLimite = computed(() => {
    const fechaParcialStr = this.formulario?.get('fechaParcial')?.value;
    if (!fechaParcialStr) return false;

    const fechaParcial = new Date(fechaParcialStr);
    const hoy = this.fechaActual();
    const diffMs = Math.abs(hoy.getTime() - fechaParcial.getTime());
    const diffDias = diffMs / (1000 * 60 * 60 * 24);
    return diffDias > this.diasLimite;
  });

  ngOnInit(): void {
    this.formulario = this.fb.group({
      fechaParcial: ['', Validators.required],
      profesor: ['', Validators.required],
      asignatura: ['', Validators.required],
      grupoAsignatura: ['', Validators.required],
      idPrograma: [null as string | null, Validators.required],
      descripcion: ['', Validators.required],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosSeleccionados.set(Array.from(input.files));
    }
  }

  eliminarArchivo(index: number): void {
    this.archivosSeleccionados.update(files => files.filter((_, i) => i !== index));
  }

  
guardar(): void {
  if (this.formulario.invalid) {
    this.formulario.markAllAsTouched();
    return;
  }

  this.guardando.set(true);
  const val = this.formulario.value;

  this.supletorioService.crearSolicitud({
    fechaParcial: val.fechaParcial,
    profesor: val.profesor,
    asignatura: val.asignatura,
    grupoAsignatura: val.grupoAsignatura,
    idPrograma: val.idPrograma,
    descripcion: val.descripcion,
    anexos: this.archivosSeleccionados(),
  }).subscribe({
    next: () => {
      this.feedbackService.show('Solicitud de supletorio enviada exitosamente.', 'success');
      this.formulario.reset();
      this.archivosSeleccionados.set([]);
      this.guardando.set(false);
    },
    error: (err) => {
      this.feedbackService.show('No se pudo enviar la solicitud.', 'error');
      this.guardando.set(false);
      console.error(err);
    }
  });
}

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
