import { Component, ChangeDetectionStrategy, input, output, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/usuario.model';
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
  `],
  templateUrl: './usuario-modal.component.html',
})
export class UsuarioModalComponent implements OnInit {
  private fb = inject(FormBuilder);

  titulo = input.required<string>();
  usuario = input<Usuario | null>(null);
  guardando = input(false);
  guardar = output<Partial<Usuario> & { password?: string; password2?: string }>();
  cerrar = output<void>();

  formulario!: FormGroup;

  ngOnInit(): void {
    const u = this.usuario();
    this.formulario = this.fb.group({
      username: [u?.username ?? '', Validators.required],
      first_name: [u?.first_name ?? '', Validators.required],
      last_name: [u?.last_name ?? '', Validators.required],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      documento: [u?.documento ?? '', Validators.required],
      telefono: [u?.telefono ?? ''],
      rol: [u?.rol ?? 'estudiante', Validators.required],
      password: ['', u ? [] : [Validators.required, Validators.minLength(6)]],
      password2: ['', u ? [] : [Validators.required]],
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
      this.guardar.emit({ ...u, ...val, password: undefined, password2: undefined });
    } else {
      this.guardar.emit(val);
    }
  }

  campoInvalido(campo: string): boolean {
    const ctrl = this.formulario.get(campo)!;
    return ctrl.invalid && ctrl.touched;
  }
}
