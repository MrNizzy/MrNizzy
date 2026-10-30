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

// `ui-sheen` (styles.scss) draws the hover light sweep with ::after. It is
// part of the interactive affordance only: static cards never get it.
// The ring follows keyboard focus (:focus-visible) on the card or inside it,
// so it does not stick around after a mouse click.
const INTERACTIVE =
  'ui-sheen hover:border-line-strong motion-safe:transition-colors focus-visible:ring-2 focus-visible:ring-focus has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus';

/** Container surface. Apply it to `article`, `section`, `li` or `div`. */
@Directive({
  selector: '[appUiCard]',
  host: { '[class]': 'classes()' },
})
export class UiCardDirective {
  readonly variant = input<CardVariant>('surface');
  readonly padding = input<CardPadding>('md');
  /**
   * Adds hover and keyboard-focus feedback (border, ring and a light sweep) for
   * cards that contain a link or button.
   */
  readonly interactive = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const parts = [BASE, VARIANTS[this.variant()], PADDINGS[this.padding()]];
    if (this.interactive()) parts.push(INTERACTIVE);
    return parts.join(' ');
  });
}
