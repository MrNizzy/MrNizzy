import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollFadeInDirective } from './scroll-fade-in.directive';

@Component({
  imports: [ScrollFadeInDirective],
  template: `<div appScrollFadeIn>content</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {}

describe('ScrollFadeInDirective', () => {
  function render(prefersReducedMotion: boolean): HTMLElement {
    spyOn(window, 'matchMedia').and.callFake(
      (query: string) =>
        ({
          matches:
            prefersReducedMotion && query === '(prefers-reduced-motion: reduce)',
        }) as MediaQueryList
    );
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('div') as HTMLElement;
  }

  it('hides and offsets the element until it enters the viewport', () => {
    const el = render(false);

    expect(el.style.opacity).toBe('0');
    expect(el.style.transform).toBe('translateY(30px)');
  });

  it('shows the element immediately when reduced motion is preferred', () => {
    const el = render(true);

    expect(el.style.opacity).toBe('');
    expect(el.style.transform).toBe('');
    expect(el.style.transition).toBe('');
  });
});
