import { DIALOG_DATA } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiDialogComponent } from '@shared/ui/dialog/dialog.component';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { ResourceApi, describeLoadError } from './resource-api';

/** What the list hands over when it opens the dialog. */
export interface ResourceDialogData {
  readonly id: string;
  /** Shown as the title right away, before the details arrive. */
  readonly name: string;
}

/** Content of the dialog opened with `UiDialog.open` from the resources list. */
@Component({
  selector: 'app-resource-dialog',
  imports: [UiButtonDirective, UiChipDirective, UiDialogComponent, UiIconComponent],
  templateUrl: './resource-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceDialogComponent {
  private readonly api = inject(ResourceApi);

  readonly data = inject<ResourceDialogData>(DIALOG_DATA);

  // Fetch resource by ID; API also auto-increments view_count
  readonly resource = this.api.getResource(signal(this.data.id).asReadonly());

  // Optimistic UI deltas
  readonly upvoteDelta = signal(0);
  readonly clickDelta = signal(0);
  readonly viewDelta = signal(0);

  /** Confirmation for screen readers (and a visible hint) after an upvote. */
  readonly upvoteMessage = signal('');

  readonly state = computed<'loading' | 'error' | 'ready'>(() => {
    if (this.resource.isLoading()) return 'loading';
    return this.resource.error() ? 'error' : 'ready';
  });

  /** Only read once the details have loaded. */
  readonly tags = computed<string[]>(() => this.resource.value().tags ?? []);

  readonly errorMessage = computed(() =>
    describeLoadError(this.resource.error())
  );

  constructor() {
    this.recordView();
  }

  async upvote(resourceId: string) {
    try {
      // optimistic increment
      this.upvoteDelta.update((u) => u + 1);
      const total = this.resource.value().upvotes + this.upvoteDelta();
      this.upvoteMessage.set(
        `Thanks for the upvote. ${total} ${total === 1 ? 'upvote' : 'upvotes'} in total.`
      );
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

  /** Trigger a view once when the dialog opens and reflect it optimistically. */
  private recordView() {
    // optimistic increment
    this.viewDelta.update((v) => v + 1);
    // fire-and-forget
    this.api
      .view(this.data.id)
      .catch((e) => console.error('Failed to record view', e));
  }
}
