import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './formulario-egresado.component.html',
})
export class FormularioEgresadoComponent implements OnInit {

  private fb = inject(FormBuilder);
  private egresadosService = inject(EgresadosService);

  formulario!: FormGroup;
  programas: Programa[] = [];
  departamentos: Departamento[] = [];
  ciudades: Ciudad[] = [];
  usuariosDisponibles: any[] = [];
  usuarioSeleccionado: any = null;
  mensajeExito = signal('');
  guardando = signal(false);

  ngOnInit(): void {
    this.formulario = this.fb.group({
      first_name: [''],
      last_name: [''],
      tipo_documento: ['CC', Validators.required],
      numero_documento: ['', Validators.required],
      fecha_nacimiento: [''],
      telefono_celular: [''],
      direccion_residencia: ['', Validators.required],
      biografia: [''],
      trabaja_actualmente: [false, Validators.required],
      programa_id: ['', Validators.required],
      departamento_id: ['', Validators.required],
      ciudad_id: ['', Validators.required],
      usuario_id: [''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);
    this.egresadosService.getDepartamentos().subscribe(d => this.departamentos = d);
    this.egresadosService.getUsuariosDisponibles().subscribe(u => this.usuariosDisponibles = u);

    this.formulario.get('departamento_id')!.valueChanges.subscribe(id => {
      if (id) {
        this.egresadosService.getCiudadesByDepartamento(id).subscribe(c => {
          this.ciudades = c;
          this.formulario.get('ciudad_id')!.setValue(c.length ? c[0].id : null);
        });
      }
    });
  }

  onUsuarioSeleccionado(usuarioId: string): void {
    const usuario = this.usuariosDisponibles.find(u => u.id === usuarioId);
    if (usuario) {
      this.usuarioSeleccionado = usuario;
      this.formulario.patchValue({
        numero_documento: usuario.documento,
        telefono_celular: usuario.telefono,
      });
    }
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const val = this.formulario.value;
    this.egresadosService.guardarEgresado({
      first_name: val.first_name,
      last_name: val.last_name,
      tipo_documento: val.tipo_documento,
      numero_documento: val.numero_documento,
      fecha_nacimiento: val.fecha_nacimiento || null,
      telefono_celular: val.telefono_celular,
      direccion_residencia: val.direccion_residencia,
      biografia: val.biografia,
      trabaja_actualmente: val.trabaja_actualmente,
      programa_id: val.programa_id || undefined,
      departamento_id: val.departamento_id || undefined,
      ciudad_id: val.ciudad_id || undefined,
      usuario_id: val.usuario_id || undefined,
    } as any).subscribe({
      next: () => {
        this.mensajeExito.set('Egresado guardado exitosamente.');
        this.formulario.reset({ tipo_documento: 'CC', trabaja_actualmente: false });
        this.guardando.set(false);
        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: () => {
        this.guardando.set(false);
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
