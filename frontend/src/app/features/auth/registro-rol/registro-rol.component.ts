import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { EgresadosService } from '../../../services/egresados.service';
import { Programa } from '../../../models/programa.model';

@Component({
  selector: 'app-registro-rol',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './registro-rol.component.html',
})
export class RegistroRolComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private egresadosService = inject(EgresadosService);
  private router = inject(Router);

  formulario!: FormGroup;
  programas: Programa[] = [];
  guardando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      documento: ['', Validators.required],
      telefono: [''],
      tipo_usuario: ['estudiante', Validators.required],
      programa_id: [''],
      direccion_residencia: [''],
      biografia: [''],
    });

    this.egresadosService.getProgramas().subscribe(p => this.programas = p);

    this.formulario.get('tipo_usuario')!.valueChanges.subscribe(tipo => {
      const prog = this.formulario.get('programa_id')!;
      if (tipo === 'egresado') {
        prog.setValidators(Validators.required);
      } else {
        prog.clearValidators();
      }
      prog.updateValueAndValidity();
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const val = this.formulario.value;
    this.usuariosService.registroConRol({
      email: val.email,
      password: val.password,
      password2: val.password2,
      first_name: val.first_name,
      last_name: val.last_name,
      documento: val.documento,
      telefono: val.telefono,
      tipo_usuario: val.tipo_usuario,
      programa_id: val.programa_id || undefined,
      direccion_residencia: val.direccion_residencia,
      biografia: val.biografia,
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        if (val.tipo_usuario === 'egresado') {
          this.router.navigate(['/registro-pendiente']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error?.detail || 'Error al registrar.');
      }
    });
  }
}
