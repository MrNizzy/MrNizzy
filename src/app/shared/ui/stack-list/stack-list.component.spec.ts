import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiStackListComponent } from './stack-list.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiStackListComponent],
  template: `<app-ui-stack-list [items]="items()" />`,
})
class HostComponent {
  public readonly items = signal<string[]>(['Angular', 'NestJS', 'PostgreSQL', 'Nginx']);
}

describe('UiStackListComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let root: HTMLElement;

  const list = () => root.querySelector('ul') as HTMLUListElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('lists the items in order under an accessible label', () => {
    expect(list().getAttribute('aria-label')).toBe('Tech stack');
    expect(
      Array.from(list().children).map((item) => item.textContent?.trim())
    ).toEqual(['Angular', 'NestJS', 'PostgreSQL', 'Nginx']);
  });

  it('keeps list semantics for Safari and VoiceOver', () => {
    expect(list().getAttribute('role')).toBe('list');
  });

  it('updates when the items change', () => {
    fixture.componentInstance.items.set(['HTML5', 'CSS3']);
    fixture.detectChanges();

    expect(
      Array.from(list().children).map((item) => item.textContent?.trim())
    ).toEqual(['HTML5', 'CSS3']);
  });

  it('shows a small uppercase "Stack" label that assistive tech skips', () => {
    const label = list().parentElement!.previousElementSibling as HTMLElement;

    expect(label.textContent?.trim()).toBe('Stack');
    expect(label.getAttribute('aria-hidden')).toBe('true');
    expect(label.classList).toContain('text-xs');
    expect(label.classList).toContain('font-semibold');
    expect(label.classList).toContain('uppercase');
    expect(label.classList).toContain('tracking-wider');
    expect(label.classList).toContain('text-fg-subtle');
  });

  it('reads as plain muted text, not as chips', () => {
    expect(list().classList).toContain('text-sm');
    expect(list().classList).toContain('text-fg-muted');
    Array.from(list().children).forEach((item) => {
      expect(item.classList).not.toContain('rounded-chip');
      expect(item.classList).not.toContain('border');
      expect(item.classList).toContain('whitespace-nowrap');
    });
  });

  it('keeps the dots visible in forced-colors mode', () => {
    expect(list().children[0].className).toContain(
      'forced-colors:before:bg-[CanvasText]'
    );
  });

  it('draws the separator dots with CSS', () => {
    const items = Array.from(list().children);

    expect(items.length).toBeGreaterThan(1);
    items.forEach((item) => {
      const dot = getComputedStyle(item, '::before');
      // No text, so nothing extra is read out.
      expect(item.textContent).not.toContain('·');
      expect(dot.width).toBe('4px');
      expect(dot.height).toBe('4px');
      expect(dot.borderRadius).not.toBe('0px');
    });
  });

  it('hides the dot that starts each line, also after a wrap', () => {
    const clip = list().parentElement!;
    clip.style.width = '160px';

    const left = clip.getBoundingClientRect().left;
    const items = Array.from(list().children) as HTMLElement[];
    const lineStarts = items.filter(
      (item, index) =>
        index === 0 || item.offsetTop !== items[index - 1].offsetTop
    );

    expect(getComputedStyle(clip).overflow).toBe('hidden');
    expect(lineStarts.length).toBeGreaterThan(1);
    lineStarts.forEach((item) => {
      const box = item.getBoundingClientRect();
      // The dot sits in the left padding of the item, which falls outside the clip.
      expect(box.left).toBeLessThan(left);
      expect(
        Math.round(box.left + parseFloat(getComputedStyle(item).paddingLeft))
      ).toBe(Math.round(left));
    });
  });
});
