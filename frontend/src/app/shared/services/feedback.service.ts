import { Injectable, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error';

export interface FeedbackMessage {
  message: string;
  kind: FeedbackKind;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly state = signal<FeedbackMessage | null>(null);
  private dismissTimer: ReturnType<typeof setTimeout> | undefined;

  readonly current = this.state.asReadonly();

  show(message: string, kind: FeedbackKind = 'success'): void {
    this.clearTimer();
    this.state.set({ message, kind });
    this.dismissTimer = setTimeout(() => this.clear(), 4000);
  }

  clear(): void {
    this.clearTimer();
    this.state.set(null);
  }

  private clearTimer(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
    }
    this.dismissTimer = undefined;
  }
}
