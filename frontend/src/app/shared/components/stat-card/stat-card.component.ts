import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .stat-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      border-left: 4px solid #0a2463;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #666;
      font-weight: 600;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #0a2463;
    }
    .stat-subtitle {
      font-size: 0.85rem;
      color: #888;
    }
  `],
  template: `
    <div class="stat-card">
      <span class="stat-label">{{ label() }}</span>
      <span class="stat-value">{{ value() }}</span>
      @if (subtitle()) {
        <span class="stat-subtitle">{{ subtitle() }}</span>
      }
    </div>
  `
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>();
}
