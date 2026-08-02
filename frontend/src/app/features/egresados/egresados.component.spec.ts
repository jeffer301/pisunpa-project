import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EgresadosComponent } from './egresados.component';
import { Egresado } from '../../models/egresado.model';

const egresadoBase: Egresado = {
  id: 1,
  nombres: 'Ana',
  apellidos: 'Pérez',
  direccion: 'Calle 1',
  edad: 24,
  fechaGraduacion: new Date('2022-01-01'),
  idPrograma: 1,
  idDepartamento: 1,
  idCiudad: 1,
  trabajaActualmente: true,
  empresa: '',
};

describe('EgresadosComponent', () => {
  let fixture: ComponentFixture<EgresadosComponent>;
  let component: EgresadosComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EgresadosComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EgresadosComponent);
    component = fixture.componentInstance;
  });

  it('filters the sin-empresa pending worklist', () => {
    component.egresados.set([
      egresadoBase,
      { ...egresadoBase, id: 2, empresa: 'Pisunpa' },
    ]);

    component.aplicarPendiente('sin-empresa');

    expect(component.egresadosFiltrados().map((egresado) => egresado.id)).toEqual([1]);
  });

  it('does not select a record for deletion before the action is requested', () => {
    expect(component.egresadoPendienteEliminacion()).toBeNull();

    component.solicitarEliminacion(egresadoBase);

    expect(component.egresadoPendienteEliminacion()).toEqual(egresadoBase);
  });
});
