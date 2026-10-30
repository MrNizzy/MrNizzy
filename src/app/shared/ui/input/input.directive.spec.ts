import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiInputDirective } from './input.directive';

// Dark tokens from styles.scss: --ds-danger #f87171.
const DANGER_DARK = 'rgb(248, 113, 113)';

@Component({
  imports: [UiInputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-theme="dark">
      <input id="input" appUiInput type="email" placeholder="Email" />
      <textarea id="textarea" appUiInput class="min-h-24"></textarea>
      <input
        id="validated"
        appUiInput
        [attr.aria-invalid]="invalid() ? 'true' : null"
      />
      <input id="disabled" appUiInput disabled />
    </div>
  `,
})
class HostComponent {
  readonly invalid = signal(false);
}

describe('UiInputDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const root = () => fixture.nativeElement as HTMLElement;
  const el = (id: string) => root().querySelector(`#${id}`) as HTMLElement;
  const borderColor = (id: string) => getComputedStyle(el(id)).borderTopColor;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    // The fields animate colour changes; read the settled value, not a frame.
    root().querySelectorAll('input, textarea').forEach((field) => {
      (field as HTMLElement).style.transition = 'none';
    });
  });

  it('styles inputs and textareas the same way', () => {
    for (const id of ['input', 'textarea']) {
      const classes = el(id).classList;
      expect(classes).withContext(id).toContain('w-full');
      expect(classes).withContext(id).toContain('rounded-control');
      expect(classes).withContext(id).toContain('border-line');
      expect(classes).withContext(id).toContain('bg-surface/60');
      expect(classes).withContext(id).toContain('text-fg');
    }
  });

  it('keeps native attributes and consumer classes', () => {
    expect(el('input').getAttribute('type')).toBe('email');
    expect(el('input').getAttribute('placeholder')).toBe('Email');
    expect(el('textarea').classList).toContain('min-h-24');
  });

  it('shows a focus ring instead of the default outline', () => {
    const classes = el('input').classList;
    expect(classes).toContain('outline-hidden');
    expect(classes).toContain('focus-visible:ring-2');
    expect(classes).toContain('focus-visible:border-accent');
  });

  it('switches to the danger border only while aria-invalid is true', () => {
    const neutral = borderColor('validated');
    expect(neutral).not.toBe(DANGER_DARK);

    host.invalid.set(true);
    fixture.detectChanges();
    expect(borderColor('validated')).toBe(DANGER_DARK);

    host.invalid.set(false);
    fixture.detectChanges();
    expect(borderColor('validated')).toBe(neutral);
  });

  it('dims disabled fields', () => {
    expect(getComputedStyle(el('disabled')).opacity).toBe('0.5');
    expect(getComputedStyle(el('input')).opacity).toBe('1');
  });
});
