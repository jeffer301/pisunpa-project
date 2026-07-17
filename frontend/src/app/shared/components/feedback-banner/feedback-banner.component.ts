import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (feedback.current(); as message) {
      <div class="feedback-banner" [class.feedback-error]="message.kind === 'error'" role="status">
        <span>{{ message.message }}</span>
        <button type="button" (click)="feedback.clear()" aria-label="Cerrar mensaje">&times;</button>
      </div>
    }
  `,
})
export class FeedbackBannerComponent {
  readonly feedback = inject(FeedbackService);
}
