import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { GestionRolesComponent } from './gestion-roles.component';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FeedbackService } from '../../../shared/services/feedback.service';
import { Usuario } from '../../../models/usuario.model';

describe('GestionRolesComponent', () => {
  let fixture: ComponentFixture<GestionRolesComponent>;
  let usuariosService: jasmine.SpyObj<UsuariosService>;
  let feedback: jasmine.SpyObj<FeedbackService>;

  const adminActivo = {
    id: 'admin-uuid-1',
    email: 'admin@pisunpa.com',
    nombre: 'Admin PISUNPA',
    rol: 'administrador',
  } as Usuario;

  const coordinador = {
    id: '485e5f9b-2c97-4139-aebd-868ce1cf343d',
    email: 'coordinador@pisunpa.com',
    nombre: 'Coordinador Egresados',
    rol: 'coordinador',
  } as Usuario;

  beforeEach(async () => {
    usuariosService = jasmine.createSpyObj('UsuariosService', ['listar', 'cambiarRol']);
    usuariosService.listar.and.returnValue(of([adminActivo, coordinador]));
    usuariosService.cambiarRol.and.returnValue(of({ ...coordinador, rol: 'secretario' }));

    feedback = jasmine.createSpyObj('FeedbackService', ['show']);

    await TestBed.configureTestingModule({
      imports: [GestionRolesComponent],
      providers: [
        { provide: UsuariosService, useValue: usuariosService },
        {
          provide: AuthService,
          useValue: {
            usuarioActivo: signal(adminActivo).asReadonly(),
            tieneRol: (...roles: string[]) => roles.includes('administrador'),
          },
        },
        { provide: FeedbackService, useValue: feedback },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionRolesComponent);
    fixture.detectChanges();
  });

  it('muestra el rol real en el dropdown y permite cambiar y guardar', () => {
    const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>('select')!;

    expect(select).toBeTruthy();
    expect(select.value).toBe('coordinador');

    select.value = 'secretario';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const boton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.btn-guardar')!;
    expect(boton.disabled).toBe(false);

    boton.click();
    fixture.detectChanges();

    expect(usuariosService.cambiarRol).toHaveBeenCalledWith(
      coordinador.id,
      'secretario'
    );
    expect(feedback.show).toHaveBeenCalledWith('Rol actualizado.');
  });

  it('el formulario de creación muestra por defecto el rol coordinador', () => {
    const botonNuevo = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button.btn-nuevo')!;
    botonNuevo.click();
    fixture.detectChanges();

    const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>('.form-crear select')!;
    expect(select).toBeTruthy();
    expect(select.value).toBe('coordinador');
  });
});
