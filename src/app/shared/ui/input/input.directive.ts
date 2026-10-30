import { Directive } from '@angular/core';
import { FIELD } from '../ui-classes';

const CLASSES = `${FIELD} placeholder:text-fg-subtle`;

/**
 * Text field styling for native `<input>` and `<textarea>`.
 *
 * The invalid state follows `aria-invalid="true"`, which Angular forms and
 * hand-written bindings can both set, so there is no separate input for it.
 */
@Directive({
  selector: 'input[appUiInput], textarea[appUiInput]',
  host: { '[class]': 'classes' },
})
export class UiInputDirective {
  protected readonly classes = CLASSES;
}
