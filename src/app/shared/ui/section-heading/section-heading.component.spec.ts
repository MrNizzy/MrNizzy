import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeadingLevel, UiSectionHeadingComponent } from './section-heading.component';

@Component({
  imports: [UiSectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-section-heading
      id="with-icon"
      [level]="level()"
      [description]="description()"
    >
      <svg icon data-testid="icon"></svg>
      Projects
    </app-ui-section-heading>
    <app-ui-section-heading id="plain">Plain title</app-ui-section-heading>
  `,
})
class HostComponent {
  readonly level = signal<HeadingLevel>(2);
  readonly description = signal<string | undefined>(undefined);
}

describe('UiSectionHeadingComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const root = (id: string) =>
    fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
  const heading = (id: string) =>
    root(id).querySelector('h1, h2') as HTMLHeadingElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('level', () => {
    it('renders a section title as an h2 by default', () => {
      const h = heading('plain');
      expect(h.tagName).toBe('H2');
      expect(h.classList).toContain('text-title');
      expect(h.classList).not.toContain('text-display');
    });

    it('renders a page title as an h1 with the display size', () => {
      host.level.set(1);
      fixture.detectChanges();

      const h = heading('with-icon');
      expect(h.tagName).toBe('H1');
      expect(h.classList).toContain('text-display');
      expect(h.classList).not.toContain('text-title');
      expect(root('with-icon').querySelector('h2')).toBeNull();
    });

    it('uses the display font and foreground colour at both levels', () => {
      for (const level of [2, 1] as const) {
        host.level.set(level);
        fixture.detectChanges();

        expect(heading('with-icon').classList).toContain('font-display');
        expect(heading('with-icon').classList).toContain('text-fg');
      }
    });
  });

  describe('content', () => {
    it('projects the default content as the title text', () => {
      expect(heading('plain').textContent?.trim()).toBe('Plain title');
    });

    it('puts the projected icon before the title inside the heading', () => {
      const h = heading('with-icon');
      expect(h.firstElementChild?.tagName.toLowerCase()).toBe('svg');
      expect(h.querySelector('span')?.textContent?.trim()).toBe('Projects');
      expect(h.classList).toContain('flex');
      expect(h.classList).toContain('items-center');
      expect(h.classList).toContain('gap-3');
    });

    it('keeps the icon out of the title text', () => {
      expect(heading('with-icon').querySelector('span svg')).toBeNull();
    });

    it('works without an icon', () => {
      expect(heading('plain').querySelector('svg')).toBeNull();
      expect(heading('plain').children.length).toBe(1);
    });

    it('keeps projected content when the level changes', () => {
      host.level.set(1);
      fixture.detectChanges();

      expect(heading('with-icon').querySelector('svg')).not.toBeNull();
      expect(heading('with-icon').textContent?.trim()).toBe('Projects');
    });
  });

  describe('description', () => {
    it('is omitted when not provided', () => {
      expect(root('with-icon').querySelector('p')).toBeNull();
    });

    it('renders below the heading as readable muted text', () => {
      host.description.set('Things I have built.');
      fixture.detectChanges();

      const p = root('with-icon').querySelector('p') as HTMLParagraphElement;
      expect(p.textContent?.trim()).toBe('Things I have built.');
      expect(p.classList).toContain('text-fg-muted');
      expect(p.classList).toContain('max-w-prose');
      expect(p.previousElementSibling).toBe(heading('with-icon'));
    });
  });
});
