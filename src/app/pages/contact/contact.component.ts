import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
  CONTACT_EMAIL_SUBJECT,
  ContactChannel,
} from '@models/contact.model';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

export type CopyState = 'idle' | 'copied' | 'failed';

const COPY_FEEDBACK_MS = 2000;

@Component({
  selector: 'app-contact',
  imports: [
    UiButtonDirective,
    UiCardDirective,
    UiIconComponent,
    UiSectionHeadingComponent,
  ],
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly clipboard = inject(Clipboard);

  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  readonly email = CONTACT_EMAIL;
  readonly channels: readonly ContactChannel[] = CONTACT_CHANNELS;
  readonly mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    CONTACT_EMAIL_SUBJECT
  )}`;

  readonly copyState = signal<CopyState>('idle');
  readonly copyAnnouncement = computed(() => {
    switch (this.copyState()) {
      case 'copied':
        return 'Email address copied to clipboard';
      case 'failed':
        return 'Copy failed';
      default:
        return '';
    }
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearResetTimer());
  }

  copyEmail(): void {
    const copied = this.clipboard.copy(this.email);
    this.copyState.set(copied ? 'copied' : 'failed');

    this.clearResetTimer();
    this.resetTimer = setTimeout(() => {
      this.resetTimer = null;
      this.copyState.set('idle');
    }, COPY_FEEDBACK_MS);
  }

  private clearResetTimer(): void {
    if (this.resetTimer !== null) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
}
