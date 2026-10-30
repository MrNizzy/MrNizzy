import { Directive, ElementRef, computed, inject, input } from '@angular/core';
import { COLOR_TRANSITION, FOCUS_RING } from '../ui-classes';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md';
export type ButtonType = 'button' | 'submit' | 'reset';

const BASE = `inline-flex items-center justify-center gap-2 rounded-control font-semibold select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING} ${COLOR_TRANSITION}`;

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm sm:text-base',
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent-fill text-white hover:bg-accent-fill-hover',
  secondary: 'border border-line-strong text-fg hover:bg-fg/5',
  ghost: 'text-fg-muted hover:text-fg hover:bg-fg/5',
};

/**
 * Button styling for native `<button>` and `<a>` elements.
 *
 * A `<button>` without an explicit `type` becomes `type="button"`, so it never
 * submits a surrounding form by accident. Set `type="submit"` to opt in.
 */
@Directive({
  selector: 'button[appUiButton], a[appUiButton]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'resolvedType()',
  },
})
export class UiButtonDirective {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  /** Native button type. Defaults to `button` on `<button>`, unused on `<a>`. */
  readonly type = input<ButtonType>();

  private readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected readonly classes = computed(
    () => `${BASE} ${SIZES[this.size()]} ${VARIANTS[this.variant()]}`
  );

  protected readonly resolvedType = computed(
    () => this.type() ?? (this.isButton ? 'button' : null)
  );
}
