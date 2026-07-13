import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';
import { Rol, ROL_LABELS } from '../../../core/auth/role.model';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-usuario-modal',
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
    .campo-check {
      margin-top: 0.5rem;
    }
    .campo-check label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
  `],
  templateUrl: './usuario-modal.component.html',
})
export class UsuarioModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  titulo = input.required<string>();
  usuario = input<Usuario | null>(null);
  guardar = output<Omit<Usuario, 'id'> | Usuario>();
  cerrar = output<void>();

  formulario!: FormGroup;
  roles: { value: Rol; label: string }[] = Object.entries(ROL_LABELS).map(
    ([value, label]) => ({ value: value as Rol, label })
  );

  ngOnInit(): void {
    const u = this.usuario();
    this.formulario = this.fb.group({
      nombre: [u?.nombre ?? '', Validators.required],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      rol: [u?.rol ?? 'egresado', Validators.required],
      activo: [u?.activo ?? true],
    });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const u = this.usuario();

    if (u) {
      this.guardar.emit({ ...u, ...val });
    } else {
      this.guardar.emit(val);
    }
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
