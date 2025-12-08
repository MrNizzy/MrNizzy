import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  input,
  signal,
  effect,
} from '@angular/core';
import { ResourceApi } from './resource-api';

@Component({
  selector: 'app-resource-dialog',
  templateUrl: './resource-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes pop {
        0% {
          transform: scale(1);
        }
        40% {
          transform: scale(1.12);
        }
        70% {
          transform: scale(0.98);
        }
        100% {
          transform: scale(1);
        }
      }
      .animate-fade-in {
        animation: fade-in 160ms ease-out forwards;
      }
      .animate-scale-in {
        animation: scale-in 180ms ease-out forwards;
      }
      .animate-pop {
        animation: pop 260ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      }
    `,
  ],
})
export class ResourceDialogComponent {
  private readonly api = inject(ResourceApi);

  // Resource ID provided by parent component
  readonly id = input.required<string>();

  // Close event emitter for parent to react (avoid DOM event name conflicts)
  readonly closed = output<void>();

  // Fetch resource by ID; API also auto-increments view_count
  readonly resource = this.api.getResource(this.id);

  // Optimistic UI deltas
  readonly upvoteDelta = signal(0);
  readonly clickDelta = signal(0);
  readonly viewDelta = signal(0);

  // UI state for animations
  readonly upvoting = signal(false);

  // Trigger a view once when dialog opens (per creation) and reflect optimistically
  readonly onOpenView = effect(() => {
    const rid = this.id();
    // optimistic increment
    this.viewDelta.update((v) => v + 1);
    // fire-and-forget
    this.api.view(rid).catch((e) => console.error('Failed to record view', e));
  });

  async upvote(resourceId: string) {
    try {
      // optimistic increment
      this.upvoteDelta.update((u) => u + 1);
      // trigger pop animation
      this.upvoting.set(false); // restart animation if clicked fast
      // In next microtask toggle to true so class re-applies
      queueMicrotask(() => this.upvoting.set(true));
      setTimeout(() => this.upvoting.set(false), 300);
      await this.api.upvote(resourceId);
    } catch (e) {
      console.error('Failed to upvote', e);
    }
  }

  async trackClick(resourceId: string) {
    try {
      // optimistic increment
      this.clickDelta.update((c) => c + 1);
      await this.api.click(resourceId);
    } catch (e) {
      console.error('Failed to track click', e);
    }
  }
}
