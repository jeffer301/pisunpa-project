import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Test Modal');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('gives the close button an accessible name', () => {
    fixture.detectChanges();
    const close = fixture.nativeElement.querySelector('.btn-cerrar') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Cerrar diálogo');
  });

  it('has dialog role on content', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.modal-content');
    expect(content.getAttribute('role')).toBe('dialog');
  });

  it('has aria-modal true on content', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.modal-content');
    expect(content.getAttribute('aria-modal')).toBe('true');
  });

  it('has aria-labelledby pointing to title', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.modal-content');
    const title = fixture.nativeElement.querySelector('h3');
    expect(content.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('close button has type button', () => {
    fixture.detectChanges();
    const close = fixture.nativeElement.querySelector('.btn-cerrar') as HTMLButtonElement;
    expect(close.type).toBe('button');
  });
});
