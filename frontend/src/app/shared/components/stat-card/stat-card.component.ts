import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border-left: 4px solid #0a2463;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .stat-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #4a5568;
      font-weight: 600;
    }
    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      color: #0a2463;
      line-height: 1.2;
    }
    .stat-subtitle {
      font-size: 0.85rem;
      color: #718096;
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
