import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { EgresadosService } from '../../services/egresados.service';
import { AuthService } from '../../core/auth/auth.service';
import { of } from 'rxjs';
import { Egresado } from '../../models/egresado.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let navigateSpy: jasmine.Spy;
  let egresadosService: jasmine.SpyObj<EgresadosService>;

  const egresadoBase: Egresado = {
    id: 1,
    nombres: 'Test',
    apellidos: 'User',
    direccion: 'Calle 1',
    edad: 25,
    fechaGraduacion: new Date('2024-01-01'),
    idPrograma: 1,
    idDepartamento: 1,
    idCiudad: 1,
    trabajaActualmente: true,
    empresa: 'Pisunpa'
  };

  beforeEach(async () => {
    egresadosService = jasmine.createSpyObj('EgresadosService', [
      'getEgresados', 'getProgramas', 'getCiudades'
    ]);
    egresadosService.getEgresados.and.returnValue(of([]));
    egresadosService.getProgramas.and.returnValue(of([]));
    egresadosService.getCiudades.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: EgresadosService, useValue: egresadosService },
        { provide: AuthService, useValue: { estaAutenticado: true } },
        provideRouter([])
      ]
    }).compileComponents();

    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counts each pending worklist independently', () => {
    component.egresados.set([
      { ...egresadoBase, id: 1, trabajaActualmente: false, empresa: '' },
      { ...egresadoBase, id: 2, trabajaActualmente: true, empresa: '' },
      { ...egresadoBase, id: 3, trabajaActualmente: true, empresa: 'Pisunpa' },
    ]);
    expect(component.sinEmpleo()).toBe(1);
    expect(component.sinEmpresa()).toBe(1);
  });

  it('navigates to the selected worklist', () => {
    component.verPendiente('sin-empresa');
    expect(navigateSpy).toHaveBeenCalledWith(['/egresados'], { queryParams: { pendiente: 'sin-empresa' } });
  });

  it('navigates to sin-empleo worklist', () => {
    component.verPendiente('sin-empleo');
    expect(navigateSpy).toHaveBeenCalledWith(['/egresados'], { queryParams: { pendiente: 'sin-empleo' } });
  });

  it('shows pending buttons when there are pending egresados', () => {
    component.egresados.set([
      { ...egresadoBase, id: 1, trabajaActualmente: false, empresa: '' },
    ]);
    fixture.detectChanges();
    const pendingButtons = fixture.nativeElement.querySelectorAll('.pendientes-btn');
    expect(pendingButtons.length).toBe(1);
  });

  it('shows no pending message when counts are zero', () => {
    component.egresados.set([
      { ...egresadoBase, id: 1, trabajaActualmente: true, empresa: 'Pisunpa' },
    ]);
    fixture.detectChanges();
    const noPending = [...fixture.nativeElement.querySelectorAll('.empty-state')]
      .find((el: HTMLElement) => el.textContent?.includes('No hay pendientes'));
    expect(noPending).toBeTruthy();
  });
});
