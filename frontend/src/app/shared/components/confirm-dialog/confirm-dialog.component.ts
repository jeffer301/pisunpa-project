import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confirm-overlay">
      <section class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{{ titulo() }}</h3>
        <p>{{ mensaje() }}</p>
        <div class="confirm-actions">
          <button type="button" data-testid="cancel" (click)="cancelar.emit()">Cancelar</button>
          <button type="button" data-testid="confirm" class="btn-eliminar" (click)="confirmar.emit()">
            {{ confirmarLabel() }}
          </button>
        </div>
      </section>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly confirmarLabel = input('Eliminar');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
