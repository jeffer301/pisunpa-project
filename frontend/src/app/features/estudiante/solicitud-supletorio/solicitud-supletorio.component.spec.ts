import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SolicitudSupletorioComponent } from './solicitud-supletorio.component';

describe('SolicitudSupletorioComponent', () => {
  let component: SolicitudSupletorioComponent;
  let fixture: ComponentFixture<SolicitudSupletorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudSupletorioComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudSupletorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('excedeLimite is false when no fecha is set', () => {
    expect(component.excedeLimite()).toBeFalse();
  });

  it('excedeLimite is true when fecha is more than 5 days ago', () => {
    const fechaLejana = new Date();
    fechaLejana.setDate(fechaLejana.getDate() - 10);
    const iso = fechaLejana.toISOString().split('T')[0];
    component.formulario.get('fechaParcial')!.setValue(iso);
    expect(component.excedeLimite()).toBeTrue();
  });

  it('excedeLimite is false when fecha is within 5 days', () => {
    const fechaReciente = new Date();
    fechaReciente.setDate(fechaReciente.getDate() - 3);
    const iso = fechaReciente.toISOString().split('T')[0];
    component.formulario.get('fechaParcial')!.setValue(iso);
    expect(component.excedeLimite()).toBeFalse();
  });

  it('submit button is disabled when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });
});
