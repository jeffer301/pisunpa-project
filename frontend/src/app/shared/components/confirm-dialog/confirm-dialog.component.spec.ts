import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('titulo', 'Eliminar egresado');
    fixture.componentRef.setInput('mensaje', 'Se eliminará a Ana Pérez.');
  });

  it('emits only when the user confirms', () => {
    const confirm = jasmine.createSpy();
    fixture.componentInstance.confirmar.subscribe(confirm);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-testid="confirm"]') as HTMLButtonElement).click();

    expect(confirm).toHaveBeenCalled();
  });
});
