import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiChipDirective } from './chip.directive';

@Component({
  imports: [UiChipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span id="label" appUiChip>Angular</span>
    <span id="label-selected" appUiChip [selected]="true">Selected label</span>
    <button id="plain-button" appUiChip type="button">Plain</button>
    <button id="toggle" appUiChip type="button" [selected]="selected()">
      Toggle
    </button>
    <button id="attribute" appUiChip type="button" selected>Attribute</button>
    <a id="link" appUiChip href="/tag/angular">Link</a>
    <button id="typeless" appUiChip>No type</button>
    <button id="submit" appUiChip type="submit">Submit</button>
  `,
})
class HostComponent {
  readonly selected = signal<boolean | undefined>(false);
}

describe('UiChipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const el = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('button type', () => {
    it('defaults a <button> chip to type="button" so it never submits a form', () => {
      expect(el('typeless').getAttribute('type')).toBe('button');
    });

    it('keeps an explicit type', () => {
      expect(el('submit').getAttribute('type')).toBe('submit');
    });

    it('adds no type to non-button hosts', () => {
      expect(el('link').hasAttribute('type')).toBeFalse();
      expect(el('label').hasAttribute('type')).toBeFalse();
    });
  });

  describe('static label', () => {
    it('has the compact chip shape', () => {
      const classes = el('label').classList;
      expect(classes).toContain('rounded-chip');
      expect(classes).toContain('border-line');
      expect(classes).toContain('px-2.5');
      expect(classes).toContain('py-1');
      expect(classes).toContain('text-xs');
      expect(classes).toContain('text-fg-muted');
    });

    it('stays inert: no hover, focus or pointer affordances', () => {
      const classes = el('label').classList;
      expect(classes).not.toContain('hover:bg-fg/5');
      expect(classes).not.toContain('cursor-pointer');
      expect(classes).not.toContain('focus-visible:ring-2');
    });

    it('does not announce a pressed state', () => {
      expect(el('label').hasAttribute('aria-pressed')).toBeFalse();
    });
  });

  describe('toggle chip', () => {
    it('reflects an unselected state with aria-pressed="false" and hover/focus styles', () => {
      const chip = el('toggle');
      expect(chip.getAttribute('aria-pressed')).toBe('false');
      expect(chip.classList).toContain('hover:border-line-strong');
      expect(chip.classList).toContain('hover:bg-fg/5');
      expect(chip.classList).toContain('focus-visible:ring-2');
      expect(chip.classList).toContain('focus-visible:ring-focus');
      expect(chip.classList).not.toContain('bg-accent-fill');
    });

    it('reflects a selected state with aria-pressed="true" and the accent fill', () => {
      host.selected.set(true);
      fixture.detectChanges();

      const chip = el('toggle');
      expect(chip.getAttribute('aria-pressed')).toBe('true');
      expect(chip.classList).toContain('bg-accent-fill');
      expect(chip.classList).toContain('text-white');
      expect(chip.classList).toContain('border-transparent');
      expect(chip.classList).not.toContain('text-fg-muted');
      expect(chip.classList).toContain('focus-visible:ring-2');
    });

    it('swaps styles back when deselected', () => {
      host.selected.set(true);
      fixture.detectChanges();
      host.selected.set(false);
      fixture.detectChanges();

      expect(el('toggle').getAttribute('aria-pressed')).toBe('false');
      expect(el('toggle').classList).not.toContain('bg-accent-fill');
      expect(el('toggle').classList).toContain('text-fg-muted');
    });

    it('stops being a toggle when selected becomes undefined', () => {
      host.selected.set(undefined);
      fixture.detectChanges();

      expect(el('toggle').hasAttribute('aria-pressed')).toBeFalse();
    });

    it('treats the bare attribute as selected', () => {
      expect(el('attribute').getAttribute('aria-pressed')).toBe('true');
      expect(el('attribute').classList).toContain('bg-accent-fill');
    });
  });

  describe('non-toggle hosts', () => {
    it('keeps a plain button interactive without aria-pressed', () => {
      expect(el('plain-button').hasAttribute('aria-pressed')).toBeFalse();
      expect(el('plain-button').classList).toContain('hover:bg-fg/5');
      expect(el('plain-button').classList).toContain('focus-visible:ring-2');
    });

    it('keeps a link interactive without aria-pressed', () => {
      expect(el('link').hasAttribute('aria-pressed')).toBeFalse();
      expect(el('link').classList).toContain('hover:bg-fg/5');
      expect(el('link').getAttribute('href')).toBe('/tag/angular');
    });

    it('applies the selected look to a non-button but never aria-pressed', () => {
      const chip = el('label-selected');
      expect(chip.classList).toContain('bg-accent-fill');
      expect(chip.hasAttribute('aria-pressed')).toBeFalse();
      expect(chip.classList).not.toContain('cursor-pointer');
    });
  });
});
