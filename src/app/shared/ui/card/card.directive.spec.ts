import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardPadding, CardVariant, UiCardDirective } from './card.directive';

@Component({
  imports: [UiCardDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article id="default" appUiCard>Default</article>
    <section
      id="configurable"
      appUiCard
      class="max-w-xl"
      [variant]="variant()"
      [padding]="padding()"
      [interactive]="interactive()"
    >
      Configurable
    </section>
    <ul>
      <li id="list-item" appUiCard interactive>Item</li>
    </ul>
    <div id="div" appUiCard>Div</div>
    <div data-theme="dark">
      <article id="focus-card" appUiCard interactive>
        <button id="focus-target" type="button">Action</button>
      </article>
    </div>
  `,
})
class HostComponent {
  readonly variant = signal<CardVariant>('surface');
  readonly padding = signal<CardPadding>('md');
  readonly interactive = signal(false);
}

describe('UiCardDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const el = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the focus-within ring in the dark theme (computed style)', () => {
    // Regression: a `none` card shadow token invalidated the whole
    // box-shadow list, so the ring never showed on dark surface cards.
    el('focus-target').focus();
    const boxShadow = getComputedStyle(el('focus-card')).boxShadow;

    expect(boxShadow).not.toBe('none');
    expect(boxShadow).toContain('rgb(244, 114, 182)');
  });

  describe('variants', () => {
    it('is an opaque surface with the card shadow by default', () => {
      const classes = el('default').classList;
      expect(classes).toContain('rounded-card');
      expect(classes).toContain('border-line');
      expect(classes).toContain('bg-surface');
      expect(classes).toContain('shadow-[var(--ds-shadow-card)]');
      expect(classes).not.toContain('backdrop-blur-md');
    });

    it('renders the glass variant translucent and blurred, without a shadow', () => {
      host.variant.set('glass');
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('bg-surface/60');
      expect(classes).toContain('backdrop-blur-md');
      expect(classes).not.toContain('bg-surface');
      expect(classes).not.toContain('shadow-[var(--ds-shadow-card)]');
    });
  });

  describe('padding', () => {
    it('uses p-6 by default', () => {
      expect(el('default').classList).toContain('p-6');
    });

    it('maps every padding option to its scale step', () => {
      const expected: Record<CardPadding, string[]> = {
        none: ['p-0'],
        sm: ['p-4'],
        md: ['p-6'],
        lg: ['p-6', 'md:p-8'],
      };

      for (const [padding, classes] of Object.entries(expected)) {
        host.padding.set(padding as CardPadding);
        fixture.detectChanges();

        for (const cls of classes) {
          expect(el('configurable').classList)
            .withContext(`${padding} should have ${cls}`)
            .toContain(cls);
        }
      }
    });

    it('does not keep the previous padding when it changes', () => {
      host.padding.set('sm');
      fixture.detectChanges();

      expect(el('configurable').classList).toContain('p-4');
      expect(el('configurable').classList).not.toContain('p-6');
    });
  });

  describe('interactive', () => {
    it('is inert by default', () => {
      const classes = el('default').classList;
      expect(classes).not.toContain('hover:border-line-strong');
      expect(classes).not.toContain('focus-within:ring-2');
    });

    it('reacts to hover and to focus inside the card', () => {
      host.interactive.set(true);
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('hover:border-line-strong');
      expect(classes).toContain('motion-safe:transition-colors');
      expect(classes).toContain('focus-within:ring-2');
      expect(classes).toContain('focus-within:ring-focus');
    });

    it('accepts the bare attribute form', () => {
      expect(el('list-item').classList).toContain('focus-within:ring-2');
    });
  });

  it('works on article, section, li and div hosts', () => {
    for (const id of ['default', 'configurable', 'list-item', 'div']) {
      expect(el(id).classList).withContext(id).toContain('rounded-card');
    }
  });

  it('keeps classes the consumer adds', () => {
    expect(el('configurable').classList).toContain('max-w-xl');
  });
});
