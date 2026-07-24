import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Egresado } from '../../../models/egresado.model';
import { Programa } from '../../../models/programa.model';
import { Departamento } from '../../../models/departamento.model';
import { Ciudad } from '../../../models/ciudad.model';
import { EgresadosService } from '../../../services/egresados.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-egresado-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .acciones-form {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .btn-cancelar {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .btn-guardar {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      background: #0a2463;
      color: #fff;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .btn-guardar:hover {
      background: #163d8f;
    }
  `],
  templateUrl: './egresado-modal.component.html',
})
export class EgresadoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private egresadosService = inject(EgresadosService);

  titulo = input.required<string>();
  egresado = input<Egresado | null>(null);
  guardando = input(false);
  guardar = output<Egresado>();
  cerrar = output<void>();

  formulario!: FormGroup;
  programas: Programa[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];

  ngOnInit(): void {
    const e = this.egresado();

    this.formulario = this.fb.group({
      tipo_documento: [e?.tipo_documento ?? 'CC', Validators.required],
      numero_documento: [e?.numero_documento ?? '', Validators.required],
      fecha_nacimiento: [e?.fecha_nacimiento ?? ''],
      telefono_celular: [e?.telefono_celular ?? ''],
      direccion_residencia: [e?.direccion_residencia ?? '', Validators.required],
      biografia: [e?.biografia ?? ''],
      trabaja_actualmente: [e?.trabaja_actualmente ?? false, Validators.required],
      programa_id: [e?.programa?.id ?? '', Validators.required],
      departamento_id: [e?.departamento?.id ?? '', Validators.required],
      ciudad_id: [e?.ciudad?.id ?? '', Validators.required],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos = d);

    if (this.formulario.get('departamento_id')!.value) {
      this.egresadosService.getCiudadesByDepartamento(this.formulario.get('departamento_id')!.value)
        .subscribe(c => this.ciudades = c);
    }

    this.formulario.get('departamento_id')!.valueChanges.subscribe(id => {
      if (id) {
        this.egresadosService.getCiudadesByDepartamento(id).subscribe(c => {
          this.ciudades = c;
          this.formulario.get('ciudad_id')!.setValue(c.length ? c[0].id : null);
        });
      }
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const e = this.egresado();

    if (e) {
      this.guardar.emit({
        ...e,
        tipo_documento: val.tipo_documento,
        numero_documento: val.numero_documento,
        fecha_nacimiento: val.fecha_nacimiento,
        telefono_celular: val.telefono_celular,
        direccion_residencia: val.direccion_residencia,
        biografia: val.biografia,
        trabaja_actualmente: val.trabaja_actualmente,
        programa: this.programas.find(p => p.id === val.programa_id) ?? null,
        departamento: this.departamentos.find(d => d.id === val.departamento_id) ?? null,
        ciudad: this.ciudades.find(c => c.id === val.ciudad_id) ?? null,
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
