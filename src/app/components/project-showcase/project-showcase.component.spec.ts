import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projects } from '@pages/home/data';
import { ProjectShowcaseComponent } from './project-showcase.component';

describe('ProjectShowcaseComponent', () => {
  let component: ProjectShowcaseComponent;
  let fixture: ComponentFixture<ProjectShowcaseComponent>;
  let root: HTMLElement;

  const chips = () =>
    Array.from(
      root.querySelectorAll<HTMLButtonElement>('[role="group"] button')
    );
  const chip = (label: string) =>
    chips().find((button) => button.textContent?.trim() === label)!;
  const cards = () =>
    Array.from(root.querySelectorAll('ul > li[class*="rounded-card"]'));
  const status = () => root.querySelector('[role="status"]') as HTMLElement;
  const iconOf = (card: Element) =>
    card.querySelector('h2')!.previousElementSibling as HTMLImageElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectShowcaseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('category filter', () => {
    it('groups the chips under an accessible label', () => {
      const group = root.querySelector('[role="group"]') as HTMLElement;

      expect(group.getAttribute('aria-label')).toBe('Filter by category');
      expect(group.classList).toContain('flex-wrap');
      expect(chips().map((button) => button.textContent?.trim())).toEqual(
        component.categories()
      );
    });

    it('renders every category as a toggle chip and pre-selects All', () => {
      chips().forEach((button) => {
        expect(button.getAttribute('type')).toBe('button');
        expect(button.classList).toContain('rounded-chip');
        expect(button.hasAttribute('aria-pressed')).toBeTrue();
      });
      expect(chip('All').getAttribute('aria-pressed')).toBe('true');
      expect(chip('All').classList).toContain('bg-accent-fill');
      expect(chip('Web').getAttribute('aria-pressed')).toBe('false');
    });

    it('shows only the projects in the selected category', () => {
      chip('Academic').click();
      fixture.detectChanges();

      const expected = projects.filter((p) =>
        p.categories?.includes('Academic')
      );
      expect(expected.length).toBeGreaterThan(0);
      expect(cards().length).toBe(expected.length);
      expect(
        Array.from(root.querySelectorAll('li h2')).map((h) =>
          h.textContent?.trim()
        )
      ).toEqual(expected.map((p) => p.title));
    });

    it('reflects the selection in aria-pressed and moves the pressed state', () => {
      chip('Game').click();
      fixture.detectChanges();

      expect(chip('Game').getAttribute('aria-pressed')).toBe('true');
      expect(chip('All').getAttribute('aria-pressed')).toBe('false');
      expect(
        chips().filter(
          (button) => button.getAttribute('aria-pressed') === 'true'
        ).length
      ).toBe(1);
    });

    it('returns to every project when All is selected again', () => {
      chip('Game').click();
      fixture.detectChanges();
      chip('All').click();
      fixture.detectChanges();

      expect(cards().length).toBe(projects.length);
    });

    it('announces the number of results in a polite live region', () => {
      expect(status().getAttribute('aria-live')).toBe('polite');
      expect(status().textContent?.trim()).toBe(
        `Showing ${projects.length} projects`
      );

      chip('Academic').click();
      fixture.detectChanges();
      const academic = projects.filter((p) =>
        p.categories?.includes('Academic')
      );
      expect(status().textContent?.trim()).toBe(
        `Showing ${academic.length} projects`
      );
    });

    it('uses the singular for a single result', () => {
      chip('Game').click();
      fixture.detectChanges();

      expect(cards().length).toBe(1);
      expect(status().textContent?.trim()).toBe('Showing 1 project');
    });
  });

  describe('project cards', () => {
    it('lists every project as a glass card in a responsive grid', () => {
      const list = root.querySelector('ul') as HTMLElement;

      expect(list.classList).toContain('grid');
      expect(list.classList).toContain('md:grid-cols-2');
      expect(list.classList).not.toContain('grid-cols-2');
      expect(cards().length).toBe(projects.length);
      cards().forEach((card) => {
        expect(card.classList).toContain('rounded-card');
        expect(card.classList).toContain('bg-surface/60');
        expect(card.classList).not.toContain('hover:border-line-strong');
      });
    });

    it('names each card with a level-2 heading in the heading style', () => {
      const headings = Array.from(root.querySelectorAll('li h2'));

      expect(headings.map((h) => h.textContent?.trim())).toEqual(
        projects.map((p) => p.title)
      );
      headings.forEach((h) => {
        expect(h.classList).toContain('text-heading');
        expect(h.className).not.toContain('uppercase');
      });
      expect(root.querySelector('h1, h3')).toBeNull();
    });

    it('shows the description in the muted colour without truncating it', () => {
      const description = cards()[0].querySelector('p') as HTMLElement;

      expect(description.textContent?.trim()).toBe(projects[0].description!);
      expect(description.classList).toContain('text-fg-muted');
      expect(description.className).not.toContain('line-clamp');
    });

    it('marks project icons as decorative with a reserved size', () => {
      const icon = iconOf(cards()[0]);

      expect(icon.tagName).toBe('IMG');
      expect(icon.getAttribute('alt')).toBe('');
      expect(icon.getAttribute('src')).toBe(projects[0].icon!);
      expect(icon.getAttribute('width')).toBe('40');
      expect(icon.getAttribute('height')).toBe('40');
      expect(icon.getAttribute('loading')).toBe('lazy');
      expect(icon.getAttribute('decoding')).toBe('async');
      expect(icon.classList).toContain('h-10');
      expect(icon.classList).toContain('w-10');
    });

    it('puts icons flagged as dark artwork on a light plate', () => {
      const flagged = projects.findIndex((p) => p.iconOnLight);
      const plain = projects.findIndex((p) => p.icon && !p.iconOnLight);
      expect(flagged).toBeGreaterThan(-1);

      const plated = iconOf(cards()[flagged]);
      const regular = iconOf(cards()[plain]);

      expect(plated.classList).toContain('bg-white');
      expect(plated.classList).toContain('w-20');
      expect(regular.classList).not.toContain('bg-white');
    });

    it('omits the icon for projects that do not have one', () => {
      const noIcon = projects.findIndex((p) => !p.icon);
      const header = cards()[noIcon].querySelector('h2')!.parentElement!;

      expect(header.querySelector('img')).toBeNull();
    });

    it('frames the screenshot with a reserved aspect ratio and descriptive alt text', () => {
      const frame = cards()[0].querySelector('.aspect-video') as HTMLElement;
      const shot = frame.querySelector('img') as HTMLImageElement;

      expect(frame.classList).toContain('rounded-control');
      expect(frame.classList).toContain('overflow-hidden');
      expect(shot.getAttribute('alt')).toBe(
        `Screenshot of ${projects[0].title}`
      );
      expect(shot.getAttribute('width')).toBe('1280');
      expect(shot.getAttribute('height')).toBe('720');
      expect(shot.getAttribute('decoding')).toBe('async');
    });

    it('serves each screenshot as responsive WebP renditions of its original', () => {
      const shots = cards().map(
        (card) => card.querySelector('.aspect-video img') as HTMLImageElement
      );

      shots.forEach((shot, index) => {
        const original = projects[index].images[0].replace(/\.[^./]+$/, '');
        const candidates = shot.getAttribute('srcset')!.split(', ');

        candidates.forEach((candidate) => {
          expect(candidate.startsWith(`${original}-`)).toBeTrue();
          expect(candidate).toMatch(/-\d+\.webp \d+w$/);
        });
        expect(candidates[candidates.length - 1]).toContain(
          shot.getAttribute('src')!
        );
        expect(shot.getAttribute('sizes')).toContain('calc(100vw');
      });
    });

    it('lazy-loads every screenshot except the first, which is the likely LCP', () => {
      const shots = cards().map(
        (card) => card.querySelector('.aspect-video img') as HTMLImageElement
      );

      expect(shots[0].getAttribute('loading')).toBe('eager');
      expect(shots[0].getAttribute('fetchpriority')).toBe('high');
      shots.slice(1).forEach((shot) => {
        expect(shot.getAttribute('loading')).toBe('lazy');
        expect(shot.hasAttribute('fetchpriority')).toBeFalse();
      });
    });

    it('lists the tags as static chips without forced uppercase', () => {
      const tags = Array.from(
        cards()[0].querySelectorAll('ul[aria-label="Tags"] > li')
      );

      expect(tags.map((tag) => tag.textContent?.trim())).toEqual(
        projects[0].tags!
      );
      tags.forEach((tag) => {
        expect(tag.classList).toContain('rounded-chip');
        expect(tag.classList).toContain('text-fg-muted');
        expect(tag.classList).not.toContain('uppercase');
        expect(tag.hasAttribute('aria-pressed')).toBeFalse();
      });
    });

    it('opens every link in a new tab and says so to screen readers', () => {
      const links = Array.from(cards()[1].querySelectorAll('a'));

      expect(links.map((a) => a.textContent)).toEqual(
        projects[1].links.map(
          (link) => `${link.text} for ${projects[1].title} (opens in a new tab)`
        )
      );
      links.forEach((a, i) => {
        expect(a.getAttribute('href')).toBe(projects[1].links[i].url);
        expect(a.getAttribute('target')).toBe('_blank');
        expect(a.getAttribute('rel')).toBe('noopener noreferrer');
        expect(a.classList).toContain('text-accent');
        expect(a.querySelector('app-ui-icon svg')).not.toBeNull();
        expect(a.querySelectorAll('.sr-only').length).toBe(2);
      });
    });

    it('does not make cards interactive or animate them on hover', () => {
      expect(root.innerHTML).not.toMatch(/hover:scale|group-hover|hover:shadow/);
      cards().forEach((card) => {
        expect(card.className).not.toContain('has-[:focus-visible]:ring-2');
      });
    });
  });

  describe('empty state', () => {
    it('explains that a category has no projects instead of rendering an empty grid', () => {
      component.selectedCategory.set('Nothing here');
      fixture.detectChanges();

      expect(root.querySelector('ul')).toBeNull();
      expect(root.querySelector('h2')).toBeNull();
      expect(root.textContent).toContain('No projects in this category yet.');
      expect(status().textContent?.trim()).toBe('Showing 0 projects');
    });
  });

  it('uses no legacy decorations', () => {
    const html = root.innerHTML;

    expect(html).not.toContain('bg-gradient');
    expect(html).not.toContain('shadow-[inset');
    expect(html).not.toContain('text-[11px]');
    expect(html).not.toMatch(/\b(?:text|bg|border)-pink|\b(?:white|black)\/\d/);
  });
});
