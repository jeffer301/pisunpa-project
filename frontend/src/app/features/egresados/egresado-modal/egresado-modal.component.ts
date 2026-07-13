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
  guardar = output<Egresado>();
  cerrar = output<void>();

  formulario!: FormGroup;
  programas: Programa[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];

  ngOnInit(): void {
    const e = this.egresado();

    this.formulario = this.fb.group({
      nombres: [e?.nombres ?? '', Validators.required],
      apellidos: [e?.apellidos ?? '', Validators.required],
      direccion: [e?.direccion ?? '', Validators.required],
      edad: [e?.edad ?? null, [Validators.required, Validators.min(18)]],
      fechaGraduacion: [e ? this.formatDate(e.fechaGraduacion) : '', Validators.required],
      idPrograma: [e?.idPrograma ?? 1, Validators.required],
      idDepartamento: [e?.idDepartamento ?? 1, Validators.required],
      idCiudad: [e?.idCiudad ?? 1, Validators.required],
      trabajaActualmente: [e?.trabajaActualmente ?? true, Validators.required],
      empresa: [e?.empresa ?? ''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos = d);
    this.egresadosService.getCiudadesByDepartamento(this.formulario.get('idDepartamento')!.value)
      .subscribe(c => this.ciudades = c);

    this.formulario.get('idDepartamento')!.valueChanges.subscribe(id => {
      this.egresadosService.getCiudadesByDepartamento(id).subscribe(c => {
        this.ciudades = c;
        this.formulario.get('idCiudad')!.setValue(c.length ? c[0].id : null);
      });
    });

    this.formulario.get('trabajaActualmente')!.valueChanges.subscribe(trabaja => {
      const empresaCtrl = this.formulario.get('empresa')!;
      if (trabaja) {
        empresaCtrl.setValidators([Validators.required]);
      } else {
        empresaCtrl.clearValidators();
        empresaCtrl.setValue('');
      }
      empresaCtrl.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const e = this.egresado();

    this.guardar.emit({
      id: e?.id ?? 0,
      nombres: val.nombres,
      apellidos: val.apellidos,
      direccion: val.direccion,
      edad: val.edad,
      fechaGraduacion: new Date(val.fechaGraduacion),
      idPrograma: val.idPrograma,
      idDepartamento: val.idDepartamento,
      idCiudad: val.idCiudad,
      trabajaActualmente: val.trabajaActualmente,
      empresa: val.trabajaActualmente ? val.empresa : '',
    });
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }

  private formatDate(fecha: Date): string {
    const d = new Date(fecha);
    return d.toISOString().split('T')[0];
  }
}
