import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EgresadosService } from '../../services/egresados.service';
import { Programa } from '../../models/programa.model';
import { Departamento } from '../../models/departamento.model';
import { Ciudad } from '../../models/ciudad.model';

@Component({
  selector: 'app-formulario-egresado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-egresado.component.html',
})
export class FormularioEgresadoComponent implements OnInit {

  formulario!: FormGroup;
  programas: Programa[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private egresadosService: EgresadosService,
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      direccion: ['', Validators.required],
      edad: [null, [Validators.required, Validators.min(18)]],
      fechaGraduacion: ['', Validators.required],
      idPrograma: [1, Validators.required],
      idDepartamento: [1, Validators.required],
      idCiudad: [2, Validators.required],
      trabajaActualmente: [true, Validators.required],
      empresa: [''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos = d);
    this.egresadosService.getCiudadesByDepartamento(1).subscribe(c => this.ciudades = c);

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

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const val = this.formulario.value;
    this.egresadosService.guardarEgresado({
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
    }).subscribe(() => {
      this.mensajeExito = 'Egresado guardado exitosamente.';
      this.formulario.reset({ idPrograma: 1, idDepartamento: 1, trabajaActualmente: true });
      this.egresadosService.getCiudadesByDepartamento(1).subscribe(c => this.ciudades = c);
      setTimeout(() => this.mensajeExito = '', 3000);
    });
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
