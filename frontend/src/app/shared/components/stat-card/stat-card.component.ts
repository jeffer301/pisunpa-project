import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .stat-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
      border-left: 4px solid #15803d;
      border-top: 1px solid #f1f5f9;
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: box-shadow 0.25s, transform 0.25s;
    }
    .stat-card:hover {
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      font-weight: 700;
    }
    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .stat-subtitle {
      font-size: 0.85rem;
      color: #15803d;
      font-weight: 600;
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
