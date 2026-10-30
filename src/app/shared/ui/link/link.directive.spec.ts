import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiLinkDirective } from './link.directive';

@Component({
  imports: [UiLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a id="internal" appUiLink href="/about">About</a>
    <a id="flag" appUiLink external href="https://example.com">Flag</a>
    <a id="bound" appUiLink [external]="external()" href="https://example.com">
      Bound
    </a>
  `,
})
class HostComponent {
  readonly external = signal(false);
}

describe('UiLinkDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const el = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLAnchorElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('styles the link as an underlined accent link', () => {
    const classes = el('internal').classList;
    expect(classes).toContain('text-accent');
    expect(classes).toContain('underline');
    expect(classes).toContain('underline-offset-4');
    expect(classes).toContain('hover:decoration-accent');
  });

  it('has a visible keyboard focus ring', () => {
    const classes = el('internal').classList;
    expect(classes).toContain('focus-visible:ring-2');
    expect(classes).toContain('focus-visible:ring-focus');
  });

  it('keeps navigation in the same tab by default', () => {
    expect(el('internal').hasAttribute('target')).toBeFalse();
    expect(el('internal').hasAttribute('rel')).toBeFalse();
    expect(el('internal').getAttribute('href')).toBe('/about');
  });

  it('opens in a new tab without leaking the opener when external', () => {
    expect(el('flag').getAttribute('target')).toBe('_blank');
    expect(el('flag').getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('follows a bound external value', () => {
    expect(el('bound').hasAttribute('target')).toBeFalse();

    host.external.set(true);
    fixture.detectChanges();
    expect(el('bound').getAttribute('target')).toBe('_blank');
    expect(el('bound').getAttribute('rel')).toBe('noopener noreferrer');

    host.external.set(false);
    fixture.detectChanges();
    expect(el('bound').hasAttribute('target')).toBeFalse();
    expect(el('bound').hasAttribute('rel')).toBeFalse();
  });
});
