import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .modal-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #0a2463;
    }
    .btn-cerrar {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.25rem;
      line-height: 1;
    }
    .btn-cerrar:hover { color: #333; }
  `],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-content" role="dialog" aria-modal="true" [attr.aria-labelledby]="'modal-title-' + titulo()">
        <div class="modal-header">
          <h3 [id]="'modal-title-' + titulo()">{{ titulo() }}</h3>
          <button type="button" class="btn-cerrar" aria-label="Cerrar diálogo" (click)="cerrar.emit()">&times;</button>
        </div>
        <ng-content />
      </div>
    </div>
  `
})
export class ModalComponent {
  titulo = input.required<string>();
  cerrar = output<void>();

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrar.emit();
    }
  }
}
