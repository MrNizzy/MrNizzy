import { Directive, booleanAttribute, computed, input } from '@angular/core';

export type CardVariant = 'surface' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const BASE = 'rounded-card border';

const VARIANTS: Record<CardVariant, string> = {
  surface: 'border-line bg-surface shadow-[var(--ds-shadow-card)]',
  // Translucent so the animated particle background stays visible behind it.
  glass: 'border-line bg-surface/60 backdrop-blur-md',
};

const PADDINGS: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 md:p-8',
};

const INTERACTIVE =
  'hover:border-line-strong motion-safe:transition-colors focus-within:ring-2 focus-within:ring-focus';

/** Container surface. Apply it to `article`, `section`, `li` or `div`. */
@Directive({
  selector: '[appUiCard]',
  host: { '[class]': 'classes()' },
})
export class UiCardDirective {
  readonly variant = input<CardVariant>('surface');
  readonly padding = input<CardPadding>('md');
  /** Adds hover and focus-within feedback for cards that contain a link or button. */
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const parts = [BASE, VARIANTS[this.variant()], PADDINGS[this.padding()]];
    if (this.interactive()) parts.push(INTERACTIVE);
    return parts.join(' ');
  });
}
