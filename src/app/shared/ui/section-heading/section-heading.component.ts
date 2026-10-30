import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type HeadingLevel = 1 | 2;

const BASE = 'flex items-center gap-3 font-display text-fg';

const LEVELS: Record<HeadingLevel, string> = {
  1: 'text-display',
  2: 'text-title',
};

/**
 * Page (`level` 1) or section (`level` 2) title with an optional icon and
 * description. Project the icon with the `icon` attribute and the title text
 * as the default content.
 */
@Component({
  selector: 'app-ui-section-heading',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid gap-2' },
  template: `
    <!-- ng-content can be declared only once, so both heading levels render it through this template. -->
    <ng-template #title>
      <ng-content select="[icon]" />
      <span><ng-content /></span>
    </ng-template>

    @if (level() === 1) {
      <h1 [class]="classes()">
        <ng-container [ngTemplateOutlet]="title" />
      </h1>
    } @else {
      <h2 [class]="classes()">
        <ng-container [ngTemplateOutlet]="title" />
      </h2>
    }

    @if (description(); as text) {
      <p class="text-fg-muted max-w-prose">{{ text }}</p>
    }
  `,
})
export class UiSectionHeadingComponent {
  readonly level = input<HeadingLevel>(2);
  readonly description = input<string>();

  protected readonly classes = computed(
    () => `${BASE} ${LEVELS[this.level()]}`
  );
}
