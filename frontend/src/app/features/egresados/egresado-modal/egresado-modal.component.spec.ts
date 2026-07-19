import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EgresadoModalComponent } from './egresado-modal.component';
import { EgresadosService } from '../../../services/egresados.service';
import { of } from 'rxjs';

describe('EgresadoModalComponent', () => {
  let component: EgresadoModalComponent;
  let fixture: ComponentFixture<EgresadoModalComponent>;
  let egresadosService: jasmine.SpyObj<EgresadosService>;

  const mockProgramas = [{ id: 1, nombre: 'Ingeniería' }];
  const mockDepartamentos = [{ id: 1, nombre: 'Valle' }];
  const mockCiudades = [{ id: 1, nombre: 'Buenaventura', idDepartamento: 1 }];

  beforeEach(async () => {
    egresadosService = jasmine.createSpyObj('EgresadosService', [
      'getProgramas', 'getDepartamentos', 'getCiudadesByDepartamento'
    ]);
    egresadosService.getProgramas.and.returnValue(of(mockProgramas));
    egresadosService.getDepartamentos.and.returnValue(of(mockDepartamentos));
    egresadosService.getCiudadesByDepartamento.and.returnValue(of(mockCiudades));

    await TestBed.configureTestingModule({
      imports: [EgresadoModalComponent],
      providers: [{ provide: EgresadosService, useValue: egresadosService }]
    }).compileComponents();

    fixture = TestBed.createComponent(EgresadoModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Nuevo Egresado');
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
      nombres: 'Ana',
      apellidos: 'Pérez',
      direccion: 'Calle 1',
      edad: 25,
      fechaGraduacion: '2024-01-01',
      idPrograma: 1,
      idDepartamento: 1,
      idCiudad: 1,
      trabajaActualmente: true,
      empresa: 'Pisunpa'
    });
    fixture.detectChanges();
    expect(save.disabled).toBeFalse();
  });

  it('requires empresa when the egresado works', () => {
    component.formulario.patchValue({ trabajaActualmente: true, empresa: '' });
    expect(component.formulario.get('empresa')!.hasError('required')).toBeTrue();
  });

  it('does not require empresa when egresado does not work', () => {
    component.formulario.patchValue({ trabajaActualmente: false, empresa: '' });
    expect(component.formulario.get('empresa')!.hasError('required')).toBeFalse();
  });

  it('disables save button while guardando is true', () => {
    component.formulario.patchValue({
      nombres: 'Ana',
      apellidos: 'Pérez',
      direccion: 'Calle 1',
      edad: 25,
      fechaGraduacion: '2024-01-01',
      idPrograma: 1,
      idDepartamento: 1,
      idCiudad: 1,
      trabajaActualmente: true,
      empresa: 'Pisunpa'
    });
    fixture.detectChanges();
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(save.disabled).toBeTrue();
  });

  it('shows Guardando... text while guardando is true', () => {
    component.formulario.patchValue({
      nombres: 'Ana',
      apellidos: 'Pérez',
      direccion: 'Calle 1',
      edad: 25,
      fechaGraduacion: '2024-01-01',
      idPrograma: 1,
      idDepartamento: 1,
      idCiudad: 1,
      trabajaActualmente: true,
      empresa: 'Pisunpa'
    });
    fixture.detectChanges();
    fixture.componentRef.setInput('guardando', true);
    fixture.detectChanges();
    const save = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(save.textContent).toContain('Guardando...');
  });
});
