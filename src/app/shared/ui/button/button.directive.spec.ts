import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonSize, ButtonType, ButtonVariant, UiButtonDirective } from './button.directive';

@Component({
  imports: [UiButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-theme="dark">
      <button id="default" appUiButton>Default</button>
      <button
        id="configurable"
        appUiButton
        class="mt-4"
        [variant]="variant()"
        [size]="size()"
        [type]="type()"
      >
        Configurable
      </button>
      <button id="static-submit" appUiButton type="submit">Submit</button>
      <button id="disabled" appUiButton disabled>Disabled</button>
      <a id="link" appUiButton href="/somewhere">Link</a>
    </div>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly size = signal<ButtonSize>('md');
  readonly type = signal<ButtonType | undefined>(undefined);
}

describe('UiButtonDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const el = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('variants', () => {
    it('is a solid accent button by default', () => {
      const classes = el('default').classList;
      expect(classes).toContain('bg-accent-fill');
      expect(classes).toContain('text-white');
      expect(classes).toContain('hover:bg-accent-fill-hover');
      expect(classes).not.toContain('border-line-strong');
    });

    it('renders the secondary variant as an outline', () => {
      host.variant.set('secondary');
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('border');
      expect(classes).toContain('border-line-strong');
      expect(classes).toContain('text-fg');
      expect(classes).not.toContain('bg-accent-fill');
    });

    it('renders the ghost variant without fill or border', () => {
      host.variant.set('ghost');
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('text-fg-muted');
      expect(classes).toContain('hover:bg-fg/5');
      expect(classes).not.toContain('bg-accent-fill');
      expect(classes).not.toContain('border-line-strong');
    });

    it('swaps variant classes instead of accumulating them', () => {
      host.variant.set('secondary');
      fixture.detectChanges();
      host.variant.set('primary');
      fixture.detectChanges();

      expect(el('configurable').classList).not.toContain('border-line-strong');
      expect(el('configurable').classList).toContain('bg-accent-fill');
    });
  });

  describe('sizes', () => {
    it('uses the md size by default', () => {
      const classes = el('default').classList;
      expect(classes).toContain('h-11');
      expect(classes).toContain('px-5');
      expect(classes).not.toContain('h-9');
    });

    it('uses the compact sm size', () => {
      host.size.set('sm');
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('h-9');
      expect(classes).toContain('px-3');
      expect(classes).not.toContain('h-11');
    });
  });

  describe('icon size', () => {
    it('is a square 44px target without horizontal padding', () => {
      host.size.set('icon');
      fixture.detectChanges();

      const classes = el('configurable').classList;
      expect(classes).toContain('size-11');
      expect(classes).not.toContain('px-5');
      expect(classes).not.toContain('h-11');
    });
  });

  describe('accessibility and states', () => {
    it('has a visible keyboard focus ring', () => {
      const classes = el('default').classList;
      expect(classes).toContain('focus-visible:ring-2');
      expect(classes).toContain('focus-visible:ring-focus');
      expect(classes).toContain('focus-visible:ring-offset-canvas');
    });

    it('only animates for users who accept motion', () => {
      expect(el('default').classList).toContain('motion-safe:transition-colors');
    });

    it('dims disabled buttons', () => {
      expect(getComputedStyle(el('disabled')).opacity).toBe('0.5');
      expect(getComputedStyle(el('default')).opacity).toBe('1');
    });

    it('keeps classes the consumer adds', () => {
      expect(el('configurable').classList).toContain('mt-4');
    });
  });

  describe('type attribute', () => {
    it('defaults a button to type="button" so it never submits a form by accident', () => {
      expect(el('default').getAttribute('type')).toBe('button');
    });

    it('respects an explicit static type', () => {
      expect(el('static-submit').getAttribute('type')).toBe('submit');
    });

    it('respects a bound type and follows it', () => {
      host.type.set('reset');
      fixture.detectChanges();
      expect(el('configurable').getAttribute('type')).toBe('reset');

      host.type.set(undefined);
      fixture.detectChanges();
      expect(el('configurable').getAttribute('type')).toBe('button');
    });

    it('does not add a type to links', () => {
      expect(el('link').hasAttribute('type')).toBeFalse();
      expect(el('link').getAttribute('href')).toBe('/somewhere');
    });
  });
});
