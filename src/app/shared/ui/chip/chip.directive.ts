import {
  Directive,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { COLOR_TRANSITION, FOCUS_RING } from '../ui-classes';

const BASE =
  'inline-flex items-center gap-1.5 rounded-chip border border-line px-2.5 py-1 text-xs font-medium';

const STATIC = 'text-fg-muted';

const INTERACTIVE = `cursor-pointer text-fg-muted hover:border-line-strong hover:text-fg hover:bg-fg/5 ${FOCUS_RING} ${COLOR_TRANSITION}`;

const SELECTED = 'bg-accent-fill text-white border-transparent';

const SELECTED_INTERACTIVE = `cursor-pointer hover:bg-accent-fill-hover ${FOCUS_RING} ${COLOR_TRANSITION}`;

/**
 * Small label for tags and filters.
 *
 * Without `selected` it is a static label. On a `<button>`, a defined
 * `selected` turns it into a toggle chip that reflects `aria-pressed`.
 */
@Directive({
  selector: '[appUiChip]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-pressed]': 'ariaPressed()',
    '[attr.type]': 'resolvedType',
  },
})
export class UiChipDirective {
  /** `undefined` = not a toggle. `true`/`false` = toggle state. */
  readonly selected = input<boolean | undefined, unknown>(undefined, {
    transform: (value) =>
      value === undefined ? undefined : booleanAttribute(value),
  });

  private readonly tag =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName;

  /** A `<button>` chip never submits a surrounding form unless asked to. */
  protected readonly resolvedType =
    inject(new HostAttributeToken('type'), { optional: true }) ??
    (this.tag === 'BUTTON' ? 'button' : null);

  private readonly isToggle = computed(
    () => this.tag === 'BUTTON' && this.selected() !== undefined
  );

  /** Clickable hosts get hover and focus styling; plain labels stay inert. */
  private readonly isInteractive = computed(
    () => this.isToggle() || this.tag === 'BUTTON' || this.tag === 'A'
  );

  protected readonly classes = computed(() => {
    const interactive = this.isInteractive();
    let state: string;
    if (this.selected() === true) {
      state = interactive ? `${SELECTED} ${SELECTED_INTERACTIVE}` : SELECTED;
    } else {
      state = interactive ? INTERACTIVE : STATIC;
    }
    return `${BASE} ${state}`;
  });

  protected readonly ariaPressed = computed(() =>
    this.isToggle() ? String(this.selected() === true) : null
  );
}
