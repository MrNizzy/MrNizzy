import { Directive, booleanAttribute, input } from '@angular/core';
import { FOCUS_RING } from '../ui-classes';

const CLASSES = `text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent rounded-sm ${FOCUS_RING}`;

/**
 * Inline text link.
 *
 * `external` opens the link in a new tab with `rel="noopener noreferrer"`.
 * Use it instead of writing `target`/`rel` by hand: the directive owns both
 * attributes and removes them when `external` is false.
 */
@Directive({
  selector: 'a[appUiLink]',
  host: {
    '[class]': 'classes',
    '[attr.target]': 'external() ? "_blank" : null',
    '[attr.rel]': 'external() ? "noopener noreferrer" : null',
  },
})
export class UiLinkDirective {
  readonly external = input(false, { transform: booleanAttribute });

  protected readonly classes = CLASSES;
}
