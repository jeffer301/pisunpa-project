import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin.component';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminComponent] }).compileComponents();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('filters users by name or email', () => {
    component.filtroBusqueda.set('roa@');

    expect(component.usuariosFiltrados().map((usuario) => usuario.id)).toEqual([2]);
  });

  it('selects a user before deletion is confirmed', () => {
    const usuario = component.usuariosService.usuarios()[0];

    component.solicitarEliminacion(usuario);

    expect(component.usuarioPendienteEliminacion()).toEqual(usuario);
  });
});
