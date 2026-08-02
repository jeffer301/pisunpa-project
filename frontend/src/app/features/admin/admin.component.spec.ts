import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminComponent } from './admin.component';
import { UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;

  const usuariosMock: Usuario[] = [
    {
      id: '1',
      nombre: 'Ana Roa',
      email: 'ana@test.com',
      rol: 'administrador',
      estado: 'aprobado',
    },
    {
      id: '2',
      nombre: 'Pedro',
      email: 'roa@test.com',
      rol: 'secretario',
      estado: 'aprobado',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent, HttpClientTestingModule],
      providers: [
        {
          provide: UsuariosService,
          useValue: { listar: jasmine.createSpy('listar').and.returnValue(of([])) },
        },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('filters users by name or email', () => {
    component.usuarios.set(usuariosMock);
    component.filtroBusqueda.set('roa@');

    expect(component.usuariosFiltrados().map((usuario) => usuario.id)).toEqual(['2']);
  });

  it('selects a user before deletion is confirmed', () => {
    const usuario = usuariosMock[0];

    component.solicitarEliminacion(usuario);

    expect(component.usuarioPendienteEliminacion()).toEqual(usuario);
  });
});
