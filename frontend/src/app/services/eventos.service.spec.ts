import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventosService } from './eventos.service';

describe('EventosService', () => {
  let service: EventosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EventosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listar() hace GET a /egresados/eventos', () => {
    service.listar().subscribe((res) => expect(res).toEqual([]));
    const req = httpMock.expectOne((r) => r.url.includes('/egresados/eventos'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('inscribirse() hace POST a /eventos/:id/inscribirse/', () => {
    service.inscribirse('abc').subscribe((res) => expect(res).toBeTruthy());
    const req = httpMock.expectOne((r) => r.url.includes('/eventos/abc/inscribirse/'));
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', evento: 'abc' });
  });

  it('crear() sin imagen envía los datos como JSON', () => {
    const payload = { nombre: 'X', descripcion: '', fecha: '2026-01-01', hora: null, lugar: '', capacidad: null };
    service.crear(payload).subscribe((res) => expect(res).toBeTruthy());
    const req = httpMock.expectOne((r) => r.url.includes('/egresados/eventos'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(payload);
    req.flush({ id: '1' });
  });

  it('crear() con imagen envía FormData con el archivo', () => {
    const payload = { nombre: 'X', descripcion: '', fecha: '2026-01-01', hora: null, lugar: '', capacidad: null };
    const archivo = new File(['x'], 'img.png', { type: 'image/png' });
    service.crear(payload, archivo).subscribe((res) => expect(res).toBeTruthy());
    const req = httpMock.expectOne((r) => r.url.includes('/egresados/eventos'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect(req.request.body.get('imagen')).toBe(archivo);
    expect(req.request.body.get('nombre')).toBe('X');
    req.flush({ id: '1' });
  });

  it('urlImagen() antepone el origen a rutas relativas de media', () => {
    expect(service.urlImagen('/media/eventos/a.png')).toBe('http://127.0.0.1:8000/media/eventos/a.png');
    expect(service.urlImagen(null)).toBeNull();
    expect(service.urlImagen('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png');
  });
});
