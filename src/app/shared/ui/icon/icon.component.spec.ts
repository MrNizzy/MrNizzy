import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiIconComponent, IconSize } from './icon.component';
import { ICONS, ICON_NAMES, IconName } from './icon.registry';

@Component({
  imports: [UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-ui-icon [name]="name()" [size]="size()" [label]="label()" />`,
})
class HostComponent {
  readonly name = signal<IconName>('mail');
  readonly size = signal<IconSize>(20);
  readonly label = signal<string | undefined>(undefined);
}

describe('UiIconComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const svg = () => fixture.nativeElement.querySelector('svg') as SVGSVGElement;
  const path = () => svg().querySelector('path') as SVGPathElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is decorative and hidden from assistive technology without a label', () => {
    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().hasAttribute('role')).toBeFalse();
    expect(svg().hasAttribute('aria-label')).toBeFalse();
  });

  it('becomes a labelled image when a label is provided', () => {
    host.label.set('Send an email');
    fixture.detectChanges();

    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe('Send an email');
    expect(svg().hasAttribute('aria-hidden')).toBeFalse();
  });

  it('treats an empty label as decorative', () => {
    host.label.set('');
    fixture.detectChanges();

    expect(svg().getAttribute('aria-hidden')).toBe('true');
    expect(svg().hasAttribute('role')).toBeFalse();
  });

  it('defaults to 20px and follows the size input', () => {
    expect(svg().getAttribute('width')).toBe('20');
    expect(svg().getAttribute('height')).toBe('20');

    host.size.set(16);
    fixture.detectChanges();

    expect(svg().getAttribute('width')).toBe('16');
    expect(svg().getAttribute('height')).toBe('16');
  });

  it('paints filled icons with currentColor and no stroke', () => {
    host.name.set('check');
    fixture.detectChanges();

    expect(svg().getAttribute('fill')).toBe('currentColor');
    expect(svg().hasAttribute('stroke')).toBeFalse();
    expect(path().getAttribute('d')).toBe(ICONS['check'].path);
  });

  it('draws outline icons as a rounded currentColor stroke', () => {
    host.name.set('menu');
    fixture.detectChanges();

    expect(svg().getAttribute('fill')).toBe('none');
    expect(svg().getAttribute('stroke')).toBe('currentColor');
    expect(svg().getAttribute('stroke-width')).toBe('1.5');
    expect(svg().getAttribute('stroke-linecap')).toBe('round');
    expect(svg().getAttribute('stroke-linejoin')).toBe('round');
  });

  it('uses the viewBox the icon was authored for', () => {
    host.name.set('github');
    fixture.detectChanges();
    expect(svg().getAttribute('viewBox')).toBe('0 0 16 16');

    host.name.set('chevron-right');
    fixture.detectChanges();
    expect(svg().getAttribute('viewBox')).toBe('0 0 1024 1024');
  });

  it('derives chevron directions from one shape by rotating it', () => {
    host.name.set('chevron-right');
    fixture.detectChanges();
    const rightPath = path().getAttribute('d');
    expect(path().hasAttribute('transform')).toBeFalse();

    host.name.set('chevron-left');
    fixture.detectChanges();
    expect(path().getAttribute('d')).toBe(rightPath);
    expect(path().getAttribute('transform')).toContain('rotate(180');

    host.name.set('chevron-down');
    fixture.detectChanges();
    expect(path().getAttribute('d')).toBe(rightPath);
    expect(path().getAttribute('transform')).toContain('rotate(90');
  });

  it('re-renders when the name changes', () => {
    const before = path().getAttribute('d');

    host.name.set('copy');
    fixture.detectChanges();

    expect(path().getAttribute('d')).not.toBe(before);
  });
});

describe('icon registry', () => {
  const REQUIRED: IconName[] = [
    'external-link',
    'arrow-up-right',
    'mail',
    'copy',
    'check',
    'close',
    'menu',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'map-pin',
    'search',
    'github',
    'sun',
    'moon',
  ];

  it('contains every icon the templates need', () => {
    expect(ICON_NAMES).toEqual(jasmine.arrayContaining(REQUIRED));
  });

  it('has a usable definition for every icon', () => {
    for (const name of ICON_NAMES) {
      const icon: { viewBox: string; path: string } = ICONS[name];
      expect(icon.path.startsWith('M') || icon.path.startsWith('m'))
        .withContext(`${name} path`)
        .toBeTrue();
      expect(icon.viewBox).withContext(`${name} viewBox`).toMatch(/^0 0 \d+ \d+$/);
    }
  });
});
