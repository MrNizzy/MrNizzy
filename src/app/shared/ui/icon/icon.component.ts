import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconDefinition, IconName } from './icon.registry';

export type IconSize = 16 | 20 | 24;

/**
 * Inline SVG icon drawn in `currentColor`, so it follows the text colour.
 *
 * Decorative by default (`aria-hidden`). Pass `label` when the icon is the only
 * thing conveying meaning: it then becomes an `img` with that accessible name.
 */
@Component({
  selector: 'app-ui-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="icon().viewBox"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="icon().stroke ? 'none' : 'currentColor'"
      [attr.stroke]="icon().stroke ? 'currentColor' : null"
      [attr.stroke-width]="icon().stroke ?? null"
      [attr.stroke-linecap]="icon().stroke ? 'round' : null"
      [attr.stroke-linejoin]="icon().stroke ? 'round' : null"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
    >
      <path [attr.d]="icon().path" [attr.transform]="icon().transform ?? null" />
    </svg>
  `,
})
export class UiIconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize>(20);
  /** Accessible name. Leave empty for decorative icons. */
  readonly label = input<string>();

  protected readonly icon = computed<IconDefinition>(() => ICONS[this.name()]);
}
