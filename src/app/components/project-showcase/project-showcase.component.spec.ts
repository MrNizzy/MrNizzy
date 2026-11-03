import { ComponentFixture, TestBed } from '@angular/core/testing';

import { projects } from '@pages/home/data';
import { ICONS } from '@shared/ui/icon/icon.registry';
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
  const stack = (card: Element) =>
    card.querySelector<HTMLElement>('ul[aria-label="Tech stack"]');
  // The action buttons: every link of the card but the aria-hidden screenshot overlay.
  const actions = (card: Element) =>
    Array.from(
      card.querySelectorAll<HTMLAnchorElement>('a:not([aria-hidden="true"])')
    );
  const text = (el: Element) =>
    el.textContent?.replace(/\s+/g, ' ').trim();
  const iconPath = (el: Element) =>
    el.querySelector('app-ui-icon svg path')?.getAttribute('d');

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
        expect(card.classList).toContain('glass-panel');
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

    it('keeps the filter chips as the only chips on the page', () => {
      expect(chips().length).toBe(component.categories().length);
      cards().forEach((card) => {
        expect(card.querySelector('ul[aria-label="Tags"]')).toBeNull();
        // The project icon also uses the chip radius, so images are excluded.
        expect(card.querySelectorAll('.rounded-chip:not(img)').length).toBe(0);
        expect(card.querySelector('[aria-pressed]')).toBeNull();
      });
    });

    it('keeps the card itself static: only the screenshot moves on hover', () => {
      expect(root.innerHTML).not.toMatch(/hover:shadow|ui-sheen/);
      cards().forEach((card) => {
        expect(card.className).not.toContain('has-[:focus-visible]:ring-2');
        expect(card.className).not.toContain('hover:');
      });
    });
  });

  describe('tech stack', () => {
    it('lists the tags in order under an accessible label', () => {
      const list = stack(cards()[0])!;

      expect(list.tagName).toBe('UL');
      expect(list.getAttribute('aria-label')).toBe('Tech stack');
      expect(
        Array.from(list.children).map((item) => item.textContent?.trim())
      ).toEqual(projects[0].tags!);
    });

    it('renders every project stack from its tags', () => {
      cards().forEach((card, index) => {
        expect(
          Array.from(stack(card)!.children).map((item) =>
            item.textContent?.trim()
          )
        ).toEqual(projects[index].tags!);
      });
    });

    it('does not list the categories as a stack when a project has no tags', () => {
      component.projects.set([
        { ...projects[0], tags: undefined, categories: ['Mobile', 'Web'] },
      ]);
      fixture.detectChanges();

      expect(stack(cards()[0])).toBeNull();
      expect(cards()[0].textContent).not.toContain('Stack');
    });

    it('omits the stack when a project has neither tags nor categories', () => {
      component.projects.set([
        { ...projects[0], tags: undefined, categories: undefined },
      ]);
      fixture.detectChanges();

      expect(stack(cards()[0])).toBeNull();
      expect(cards()[0].textContent).not.toContain('Stack');
    });

  });

  describe('action buttons', () => {
    it('opens every link in a new tab and says so to screen readers', () => {
      cards().forEach((card, index) => {
        const project = projects[index];
        const links = actions(card);

        expect(links.length).toBe(project.links.length);
        expect(links.map((a) => text(a))).toEqual(
          project.links.map(
            (link) => `${link.text} for ${project.title} (opens in a new tab)`
          )
        );
        links.forEach((a, i) => {
          expect(a.getAttribute('href')).toBe(project.links[i].url);
          expect(a.getAttribute('target')).toBe('_blank');
          expect(a.getAttribute('rel')).toBe('noopener noreferrer');
          expect(a.querySelectorAll('.sr-only').length).toBe(2);
          expect(a.querySelector('.sr-only')!.textContent).toBe(
            ` for ${project.title}`
          );
          expect(a.querySelector('.sr-only:last-child')!.textContent).toBe(
            ' (opens in a new tab)'
          );
        });
      });
    });

    it('renders every link as a small button instead of an underlined link', () => {
      cards().forEach((card) => {
        actions(card).forEach((a) => {
          expect(a.classList).toContain('rounded-control');
          expect(a.classList).toContain('h-9');
          expect(a.classList).toContain('px-3');
          expect(a.classList).not.toContain('underline');
          expect(a.classList).not.toContain('text-accent');
        });
      });
    });

    it('makes the first link of every project the only primary button', () => {
      cards().forEach((card) => {
        const buttons = actions(card);
        const primary = buttons.filter((a) =>
          a.classList.contains('bg-accent-fill')
        );

        expect(primary.length).toBe(1);
        expect(primary[0]).toBe(buttons[0]);
      });
    });

    it('renders every other link as a secondary button', () => {
      const withSeveralLinks = cards().filter((card) => actions(card).length > 1);
      expect(withSeveralLinks.length).toBeGreaterThan(0);

      withSeveralLinks.forEach((card) => {
        actions(card)
          .slice(1)
          .forEach((a) => {
            expect(a.classList).toContain('glass-control');
            expect(a.classList).toContain('border-line-strong');
            expect(a.classList).not.toContain('bg-accent-fill');
          });
      });
    });

    it('gives a repo-only project a single primary button', () => {
      const repoOnly = projects.findIndex(
        (p) => p.links.length === 1 && p.links[0].url.includes('github.com')
      );
      expect(repoOnly).toBeGreaterThan(-1);

      const buttons = actions(cards()[repoOnly]);
      expect(buttons.length).toBe(1);
      expect(buttons[0].classList).toContain('bg-accent-fill');
    });

    it('puts the GitHub mark before the label of links to github.com', () => {
      let seen = 0;
      cards().forEach((card, index) => {
        actions(card).forEach((a, i) => {
          if (!projects[index].links[i].url.startsWith('https://github.com/')) {
            return;
          }
          seen++;
          expect(
            Array.from(a.children).map((child) => child.tagName)
          ).toEqual(['APP-UI-ICON', 'SPAN', 'SPAN']);
          expect(iconPath(a)).toBe(ICONS.github.path);
          expect(a.querySelector('svg')!.getAttribute('width')).toBe('16');
        });
      });
      expect(seen).toBeGreaterThan(0);
    });

    it('puts an arrow after the label of any other link', () => {
      let seen = 0;
      cards().forEach((card, index) => {
        actions(card).forEach((a, i) => {
          if (projects[index].links[i].url.startsWith('https://github.com/')) {
            return;
          }
          seen++;
          // Label, then the "for {project}" text, the arrow, the "new tab" text.
          expect(
            Array.from(a.children).map((child) => child.tagName)
          ).toEqual(['SPAN', 'APP-UI-ICON', 'SPAN']);
          expect(iconPath(a)).toBe(ICONS['arrow-up-right'].path);
          expect(a.querySelector('svg')!.getAttribute('width')).toBe('16');
        });
      });
      expect(seen).toBeGreaterThan(0);
    });

    it('keeps the icons decorative', () => {
      cards().forEach((card) => {
        card.querySelectorAll('app-ui-icon svg').forEach((svg) => {
          expect(svg.getAttribute('aria-hidden')).toBe('true');
        });
      });
    });

    it('does not mistake look-alike hosts for GitHub', () => {
      component.projects.set([
        {
          ...projects[0],
          links: [
            { text: 'One', url: 'https://github.com.evil.example/repo' },
            { text: 'Two', url: 'https://raw.githubusercontent.com/a/b' },
            { text: 'Three', url: 'not a url' },
          ],
        },
      ]);
      fixture.detectChanges();

      actions(cards()[0]).forEach((a) => {
        expect(iconPath(a)).toBe(ICONS['arrow-up-right'].path);
      });
    });

    it('lets labels wrap the row instead of truncating', () => {
      const row = actions(cards()[0])[0].parentElement as HTMLElement;

      expect(row.classList).toContain('flex');
      expect(row.classList).toContain('flex-wrap');
      cards().forEach((card) => {
        actions(card).forEach((a) => {
          expect(a.classList).toContain('basis-[calc(50%-0.25rem)]');
          expect(a.classList).toContain('min-w-fit');
          expect(a.classList).toContain('whitespace-nowrap');
          expect(a.className).not.toContain('truncate');
        });
      });
    });

    describe('layout', () => {
      const GAP = 8;
      const rect = (el: Element) => el.getBoundingClientRect();
      const rowOf = (card: Element) =>
        actions(card)[0].parentElement as HTMLElement;
      // A 320px phone minus the page gutters (px-4 on each side).
      const PHONE = 288;
      // Every button stays inside its row: nothing spills out of the card.
      const fitsRow = () =>
        cards().forEach((card) => {
          const row = rect(rowOf(card));
          actions(card).forEach((a) => {
            expect(rect(a).left).toBeGreaterThanOrEqual(row.left - 0.5);
            expect(rect(a).right).toBeLessThanOrEqual(row.right + 0.5);
          });
        });

      // The component host is inline by default; give it a width so the cards,
      // and so the button rows, have a known size whatever the Karma window is.
      const resize = (width: number) => {
        root.style.display = 'block';
        root.style.width = `${width}px`;
      };

      it('splits the row into two equal halves', () => {
        resize(1000);
        const card = cards()[projects.findIndex((p) => p.links.length === 2)];
        const [first, second] = actions(card);

        expect(rect(first).top).toBeCloseTo(rect(second).top, 0);
        expect(rect(first).width).toBeCloseTo(rect(second).width, 0);
        expect(rect(first).width).toBeCloseTo(
          (rect(rowOf(card)).width - GAP) / 2,
          0
        );
        fitsRow();
      });

      it('keeps a lone button at half width, left-aligned', () => {
        resize(1000);
        const card = cards()[projects.findIndex((p) => p.links.length === 1)];
        const [only] = actions(card);

        expect(rect(only).left).toBeCloseTo(rect(rowOf(card)).left, 0);
        expect(rect(only).width).toBeCloseTo(
          (rect(rowOf(card)).width - GAP) / 2,
          0
        );
      });

      it('gives a lone button the same width as each of a pair', () => {
        resize(1000);
        const lone = cards()[projects.findIndex((p) => p.links.length === 1)];
        const pair = cards()[projects.findIndex((p) => p.links.length === 2)];

        expect(rect(actions(lone)[0]).width).toBeCloseTo(
          rect(actions(pair)[0]).width,
          0
        );
      });

      it('grows a button to fit its label and stacks the row when it must', () => {
        resize(PHONE);
        const card = cards()[projects.findIndex((p) => p.links.length === 2)];
        const [first, second] = actions(card);

        expect(rect(second).top).toBeGreaterThan(rect(first).top);
        fitsRow();
      });

      it('fits the longest label on a small phone without truncating it', () => {
        resize(PHONE);
        const nshorts = projects.findIndex((p) =>
          p.links.some((link) => link.text === 'Open API (URL preview)')
        );
        expect(nshorts).toBeGreaterThan(-1);
        const [button] = actions(cards()[nshorts]);
        const row = rect(rowOf(cards()[nshorts]));

        // Wider than half the row, so it grew to its label, yet inside the card.
        expect(rect(button).width).toBeGreaterThan((row.width - GAP) / 2);
        expect(rect(button).right).toBeLessThanOrEqual(row.right + 0.5);
        expect(getComputedStyle(button).textOverflow).not.toBe('ellipsis');
        fitsRow();
      });
    });
  });

  describe('screenshot link', () => {
    it('overlays the screenshot with a pointer-only link to the first link', () => {
      cards().forEach((card, index) => {
        const frame = card.querySelector('.aspect-video') as HTMLElement;
        const overlay = frame.querySelector('a') as HTMLAnchorElement;

        expect(frame.classList).toContain('relative');
        expect(overlay.getAttribute('href')).toBe(projects[index].links[0].url);
        expect(overlay.getAttribute('target')).toBe('_blank');
        expect(overlay.getAttribute('rel')).toBe('noopener noreferrer');
        expect(overlay.getAttribute('tabindex')).toBe('-1');
        expect(overlay.getAttribute('aria-hidden')).toBe('true');
        expect(overlay.classList).toContain('absolute');
        expect(overlay.classList).toContain('inset-0');
        expect(overlay.textContent?.trim()).toBe('');
      });
    });

    it('points at the same place as the primary button', () => {
      cards().forEach((card) => {
        const overlay = card.querySelector('.aspect-video a')!;

        expect(overlay.getAttribute('href')).toBe(
          actions(card)[0].getAttribute('href')
        );
      });
    });

    it('is the only link outside the button row, so it never doubles up for assistive tech', () => {
      cards().forEach((card) => {
        const hidden = card.querySelectorAll('a[aria-hidden="true"]');

        expect(hidden.length).toBe(1);
        expect(actions(card).length).toBe(
          card.querySelectorAll('a').length - 1
        );
      });
    });

    it('covers the whole screenshot and catches the pointer above it', () => {
      const frame = cards()[0].querySelector('.aspect-video') as HTMLElement;
      const overlay = frame.querySelector('a') as HTMLElement;
      const shot = frame.querySelector('img') as HTMLElement;

      frame.scrollIntoView({ block: 'center' });
      const area = overlay.getBoundingClientRect();
      const image = shot.getBoundingClientRect();

      expect(area.left).toBeCloseTo(image.left, 0);
      expect(area.top).toBeCloseTo(image.top, 0);
      expect(area.width).toBeCloseTo(image.width, 0);
      expect(area.height).toBeCloseTo(image.height, 0);
      expect(
        document.elementFromPoint(
          area.left + area.width / 2,
          area.top + area.height / 2
        )
      ).toBe(overlay);
    });

    it('keeps the image outside the link so its alt text stays available', () => {
      cards().forEach((card, index) => {
        const shot = card.querySelector('.aspect-video img') as HTMLElement;

        expect(shot.closest('a')).toBeNull();
        expect(shot.getAttribute('alt')).toBe(
          `Screenshot of ${projects[index].title}`
        );
      });
    });

    it('zooms the screenshot slowly on hover, only for users who accept motion', () => {
      cards().forEach((card) => {
        const frame = card.querySelector('.aspect-video') as HTMLElement;
        const shot = frame.querySelector('img') as HTMLElement;
        const classes = Array.from(shot.classList);

        expect(frame.classList).toContain('group');
        expect(classes).toContain('motion-safe:group-hover:scale-103');
        expect(classes).toContain('motion-safe:transition-transform');
        expect(classes).toContain('motion-safe:duration-500');
        // Nothing moves unless it is behind the motion-safe variant.
        classes
          .filter((name) => /scale|transition|duration/.test(name))
          .forEach((name) => expect(name.startsWith('motion-safe:')).toBeTrue());
      });
    });

    it('keeps the eager/lazy loading choice and responsive sources', () => {
      const shots = cards().map(
        (card) => card.querySelector('.aspect-video img') as HTMLImageElement
      );

      expect(shots[0].getAttribute('loading')).toBe('eager');
      expect(shots[0].getAttribute('fetchpriority')).toBe('high');
      shots.forEach((shot) => {
        expect(shot.getAttribute('srcset')).toContain(' ');
        expect(shot.getAttribute('sizes')).toContain('calc(100vw');
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
