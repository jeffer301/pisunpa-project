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
});
