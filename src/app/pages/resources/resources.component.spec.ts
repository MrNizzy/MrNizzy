import { Dialog } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { UiSelectComponent } from '@shared/ui/select/select.component';
import type { Resource } from './resource.model';
import { ResourcesComponent } from './resources.component';
import { RESOURCE_CATALOG } from './resources.data';

function makeResource(n: number, overrides: Partial<Resource> = {}): Resource {
  return {
    id: `res-${n}`,
    name: `Resource ${n}`,
    url: `https://example.com/${n}`,
    image: `https://example.com/${n}.png`,
    repository: `https://github.com/example/${n}`,
    description: `Description of resource ${n}.`,
    type: 'tool',
    category: 'frontend',
    tags: ['angular', 'css'],
    ...overrides,
  };
}

const TAILWIND = makeResource(1, {
  name: 'Tailwind CSS',
  type: 'library',
  category: 'styling',
  tags: ['css', 'utility-first'],
});
const CDK = makeResource(2, {
  name: 'Angular CDK',
  type: 'library',
  category: 'frontend',
  tags: ['angular', 'a11y'],
  repository: undefined,
});
const EXCALIDRAW = makeResource(3, {
  name: 'Excalidraw',
  type: 'tool',
  category: 'design',
  tags: [],
  url: '',
});
const ITEMS = [TAILWIND, CDK, EXCALIDRAW];

const KEY_CODES: Record<string, number> = { Escape: 27 };

function press(key: string, target: EventTarget): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      keyCode: KEY_CODES[key],
      bubbles: true,
      cancelable: true,
    })
  );
}

describe('ResourcesComponent', () => {
  let fixture: ComponentFixture<ResourcesComponent>;
  let root: HTMLElement;

  async function settle(): Promise<void> {
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    fixture.detectChanges();
    TestBed.tick();
  }

  function render(catalog: readonly Resource[] = ITEMS): void {
    TestBed.configureTestingModule({
      imports: [ResourcesComponent],
      providers: [
        provideRouter([]),
        { provide: RESOURCE_CATALOG, useValue: catalog },
      ],
    });
    fixture = TestBed.createComponent(ResourcesComponent);
    fixture.detectChanges();
    TestBed.tick();
    root = fixture.nativeElement;
  }

  const $ = <T extends Element = HTMLElement>(selector: string) =>
    root.querySelector<T>(selector);
  const $$ = <T extends Element = HTMLElement>(selector: string) =>
    Array.from(root.querySelectorAll<T>(selector));
  const buttonByText = (text: string) =>
    $$<HTMLButtonElement>('button').find((b) => b.textContent?.trim() === text);
  const count = () => $('p[role="status"]')?.textContent?.trim();
  const cardTitles = () => $$('li h2').map((h) => h.textContent?.trim());
  const cardOf = (name: string) =>
    $$('li').find((li) => li.querySelector('h2')?.textContent?.includes(name))!;

  function type(text: string): void {
    const input = $<HTMLInputElement>('input[type="search"]')!;
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function selects() {
    return fixture.debugElement
      .queryAll(By.directive(UiSelectComponent))
      .map((d) => d.componentInstance as UiSelectComponent);
  }

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  describe('page title', () => {
    beforeEach(() => render());

    it('has exactly one level-1 heading with a description', () => {
      const headings = $$('h1');
      expect(headings.length).toBe(1);
      expect(headings[0].textContent?.trim()).toBe('Resources');
      expect($('app-ui-section-heading p')?.textContent).toContain(
        'Search by name or tag'
      );
    });

    it('does not wrap the title in a card', () => {
      expect($('h1')!.closest('[class*="rounded-card"]')).toBeNull();
    });

    it('uses level-2 headings for the cards, so no level is skipped', () => {
      const levels = $$('h1, h2, h3, h4').map((h) => +h.tagName[1]);
      expect(levels).toEqual([1, 2, 2, 2]);
    });
  });

  describe('empty catalog', () => {
    beforeEach(() => render([]));

    it('invites the visitor instead of apologising', () => {
      expect($('h2')?.textContent?.trim()).toBe('Nothing here yet');
      expect($('[role="alert"]')).toBeNull();
    });

    it('points to the projects page', () => {
      const link = $<HTMLAnchorElement>('a[href="/projects"]')!;

      expect(link.textContent?.trim()).toBe('See my projects');
    });

    it('does not render filters when there is nothing to filter', () => {
      expect($('input[type="search"]')).toBeNull();
      expect(selects().length).toBe(0);
    });
  });

  describe('resource list', () => {
    beforeEach(() => render());

    it('renders one list item per resource with the name as an h2', () => {
      const items = $$('ul > li').filter((li) => li.querySelector(':scope h2'));

      expect(items.length).toBe(3);
      expect(cardTitles()).toEqual(['Tailwind CSS', 'Angular CDK', 'Excalidraw']);
    });

    it('uses glass interactive cards', () => {
      const card = $('li h2')!.closest('li')!;

      expect(card.className).toContain('glass-panel');
      expect(card.className).toContain('has-[:focus-visible]:ring-2');
    });

    it('renders tags as a labelled list of static chips', () => {
      const tags = cardOf('Tailwind').querySelector('ul[aria-label="Tags"]')!;

      expect(
        Array.from(tags.querySelectorAll('li')).map((t) => t.textContent?.trim())
      ).toEqual(['css', 'utility-first']);
      expect(tags.querySelector('button')).toBeNull();
    });

    it('does not leave an empty tag list behind', () => {
      const empty = cardOf('Excalidraw').querySelector<HTMLElement>(
        'ul[aria-label="Tags"]'
      )!;

      expect(empty.children.length).toBe(0);
      expect(getComputedStyle(empty).display).toBe('none');
    });

    it('opens external links in a new tab and says so', () => {
      const links = Array.from(
        cardOf('Tailwind').querySelectorAll<HTMLAnchorElement>('a')
      );

      expect(links.map((a) => a.href)).toEqual([
        'https://example.com/1',
        'https://github.com/example/1',
      ]);
      links.forEach((a) => {
        expect(a.target).toBe('_blank');
        expect(a.rel).toContain('noopener');
        expect(a.querySelector('.sr-only')?.textContent).toContain(
          'for Tailwind CSS'
        );
        expect(a.textContent).toContain('(opens in a new tab)');
      });
    });

    it('omits the links a resource does not have', () => {
      expect(
        Array.from(cardOf('CDK').querySelectorAll('a')).map((a) => a.textContent)
      ).toEqual([jasmine.stringContaining('Website')]);
      expect(
        Array.from(cardOf('Excalidraw').querySelectorAll('a')).map(
          (a) => a.textContent
        )
      ).toEqual([jasmine.stringContaining('Repository')]);
    });

    it('does not show any activity counters', () => {
      expect($('ul[aria-label="Activity"]')).toBeNull();
    });

    it('uses the design tokens only, with no raw palette or alpha classes', () => {
      expect(root.innerHTML).not.toMatch(
        /\b(?:text-white|bg-black|border-white|white\/|black\/|pink-\d)/
      );
    });
  });

  describe('filters', () => {
    beforeEach(() => render());

    it('labels the search field and uses a search input', () => {
      const input = $<HTMLInputElement>('input')!;
      const label = $<HTMLLabelElement>(`label[for="${input.id}"]`)!;

      expect(input.type).toBe('search');
      expect(label.textContent?.trim()).toBe('Search');
    });

    it('lists the distinct types and categories, with "all" first', () => {
      const [typeSelect, categorySelect] = selects();

      expect(typeSelect.options()).toEqual(['all', 'library', 'tool']);
      expect(categorySelect.options()).toEqual([
        'all',
        'design',
        'frontend',
        'styling',
      ]);
    });

    it('announces the total politely, and the count whenever filters change', async () => {
      const status = $('p[role="status"]')!;
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.getAttribute('aria-atomic')).toBe('true');
      expect(count()).toBe('Showing 3 resources');

      type('angular');
      await settle();

      expect(count()).toBe('Showing 1 of 3 resources');
      expect(cardTitles()).toEqual(['Angular CDK']);
    });

    it('searches names, descriptions and tags without caring about case', async () => {
      type('UTILITY');
      await settle();
      expect(cardTitles()).toEqual(['Tailwind CSS']);

      type('description of resource 3');
      await settle();
      expect(cardTitles()).toEqual(['Excalidraw']);

      type('cdk');
      await settle();
      expect(cardTitles()).toEqual(['Angular CDK']);
    });

    it('filters by type and by category together with the search', async () => {
      selects()[0].value.set('library');
      await settle();
      expect(count()).toBe('Showing 2 of 3 resources');

      selects()[1].value.set('styling');
      await settle();
      expect(cardTitles()).toEqual(['Tailwind CSS']);

      type('nothing like this');
      await settle();
      expect(count()).toBe('Showing 0 of 3 resources');
    });

    it('explains when nothing matches and offers to clear the filters', async () => {
      type('zzzz');
      await settle();

      expect($('li h2')).toBeNull();
      expect($('h2')?.textContent?.trim()).toBe('No resources match');
      expect(buttonByText('Clear filters')).toBeDefined();
      // The filters stay on screen so the search can be changed.
      expect($('input[type="search"]')).not.toBeNull();
    });

    it('"Clear filters" resets everything and moves focus to the search field', async () => {
      type('zzzz');
      selects()[0].value.set('tool');
      await settle();

      const clear = buttonByText('Clear filters')!;
      clear.focus();
      clear.click();
      await settle();

      const input = $<HTMLInputElement>('input[type="search"]')!;
      expect(input.value).toBe('');
      expect(selects().map((s) => s.value())).toEqual(['all', 'all']);
      expect(count()).toBe('Showing 3 resources');
      expect(cardTitles().length).toBe(3);
      expect(document.activeElement).toBe(input);
    });

    it('has a labelled clear button for the search text only while there is text', async () => {
      expect($('button[aria-label="Clear search"]')).toBeNull();

      type('css');
      await settle();
      const clear = $<HTMLButtonElement>('button[aria-label="Clear search"]')!;
      expect(clear).not.toBeNull();

      clear.click();
      await settle();

      const input = $<HTMLInputElement>('input[type="search"]')!;
      expect(input.value).toBe('');
      expect(document.activeElement).toBe(input);
      expect($('button[aria-label="Clear search"]')).toBeNull();
      expect(count()).toBe('Showing 3 resources');
    });
  });

  describe('details dialog', () => {
    beforeEach(() => render());

    const container = () =>
      document.querySelector<HTMLElement>('.cdk-dialog-container');

    function open(index: number): HTMLButtonElement {
      const trigger = $$<HTMLButtonElement>('li h2 button')[index];
      trigger.focus();
      trigger.click();
      fixture.detectChanges();
      TestBed.tick();
      return trigger;
    }

    it('opens from the keyboard-operable heading button with the name as title', () => {
      const trigger = $<HTMLButtonElement>('li h2 button')!;

      expect(trigger.type).toBe('button');
      expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
      expect(trigger.textContent?.trim()).toBe('Tailwind CSS');

      open(0);

      const dialog = container()!;
      expect(dialog.getAttribute('role')).toBe('dialog');
      expect(
        document.getElementById(dialog.getAttribute('aria-labelledby')!)
          ?.textContent?.trim()
      ).toBe('Tailwind CSS');
      expect(dialog.contains(document.activeElement)).toBeTrue();
    });

    it('closes with Escape and gives focus back to the heading button', async () => {
      const trigger = open(0);

      press('Escape', document.activeElement!);
      await settle();

      expect(container()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('opens the dialog for the resource that was chosen', () => {
      open(1);

      expect(
        document.getElementById(container()!.getAttribute('aria-labelledby')!)
          ?.textContent?.trim()
      ).toBe('Angular CDK');
      expect(container()!.textContent).toContain('Description of resource 2.');
    });
  });
});
