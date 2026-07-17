import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioModalComponent } from './usuario-modal.component';

describe('UsuarioModalComponent', () => {
  let component: UsuarioModalComponent;
  let fixture: ComponentFixture<UsuarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Nuevo Usuario');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('disables saving until required fields are valid', () => {
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
    component.formulario.patchValue({
      nombre: 'Ana',
      email: 'ana@example.com',
      rol: 'secretario',
      activo: true
    });
    fixture.detectChanges();
    expect(save.disabled).toBeFalse();
  });

  it('validates email format', () => {
    component.formulario.patchValue({ email: 'invalido' });
    expect(component.formulario.get('email')!.hasError('email')).toBeTrue();
    component.formulario.patchValue({ email: 'ana@example.com' });
    expect(component.formulario.get('email')!.hasError('email')).toBeFalse();
  });

  it('disables save button while guardando is true', () => {
    component.formulario.patchValue({
      nombre: 'Ana',
      email: 'ana@example.com',
      rol: 'secretario',
      activo: true
    });
    fixture.detectChanges();
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
  });

  it('shows Guardando... text while guardando is true', () => {
    component.formulario.patchValue({
      nombre: 'Ana',
      email: 'ana@example.com',
      rol: 'secretario',
      activo: true
    });
    fixture.detectChanges();
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(save.textContent).toContain('Guardando...');
  });

  it('emits guardar with user data when form is valid', () => {
    const guardarSpy = jasmine.createSpy('guardar');
    component.guardar.subscribe(guardarSpy);
    component.formulario.patchValue({
      nombre: 'Ana',
      email: 'ana@example.com',
      rol: 'secretario',
      activo: true
    });
    fixture.detectChanges();
    component.onSubmit();
    expect(guardarSpy).toHaveBeenCalled();
  });
});
