import { Dialog } from '@angular/cdk/dialog';
import { TestBed } from '@angular/core/testing';
import { UiDialog } from '@shared/ui/dialog/dialog.service';
import { ResourceDialogComponent } from './resource-dialog.component';
import type { Resource } from './resource.model';

const RESOURCE: Resource = {
  id: 'tailwind',
  name: 'Tailwind CSS',
  url: 'https://tailwindcss.com',
  image: 'https://example.com/tailwind.png',
  repository: 'https://github.com/tailwindlabs/tailwindcss',
  description: 'A utility-first CSS framework.',
  type: 'library',
  category: 'styling',
  added: '2026-11-04',
  tags: ['css', 'utility-first'],
};

describe('ResourceDialogComponent', () => {
  const container = () =>
    document.querySelector<HTMLElement>('.cdk-dialog-container');
  const $ = <T extends Element = HTMLElement>(selector: string) =>
    container()?.querySelector<T>(selector) ?? null;
  const actions = () =>
    Array.from(container()?.querySelectorAll<HTMLElement>('footer a, footer button') ?? []);
  const action = (text: string) =>
    actions().find((el) =>
      el.textContent?.replace(/\s+/g, ' ').trim().startsWith(text)
    );
  const stat = (label: string) =>
    Array.from(container()?.querySelectorAll('dt') ?? [])
      .find((dt) => dt.textContent?.trim() === label)
      ?.nextElementSibling?.textContent?.trim();

  function open(resource: Resource = RESOURCE): void {
    TestBed.inject(UiDialog).open<void, Resource, ResourceDialogComponent>(
      ResourceDialogComponent,
      { data: resource }
    );
    TestBed.tick();
    TestBed.tick();
  }

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  describe('layout', () => {
    it('uses the design system dialog titled with the resource name', () => {
      open();

      expect($('app-ui-dialog')).not.toBeNull();
      expect($('h2')?.textContent?.trim()).toBe('Tailwind CSS');
      expect($('[aria-label="Close dialog"]')).not.toBeNull();
    });

    it('shows the description, tags, type and category', () => {
      open();

      expect(container()?.textContent).toContain('A utility-first CSS framework.');
      expect(
        Array.from(container()!.querySelectorAll('ul[aria-label="Tags"] li')).map(
          (li) => li.textContent?.trim()
        )
      ).toEqual(['css', 'utility-first']);
      expect(stat('Type')).toBe('library');
      expect(stat('Category')).toBe('styling');
      expect(stat('Added')).toBe('November 2026');
    });

    it('does not show counters, voting or loading states', () => {
      open();

      expect(stat('Views')).toBeUndefined();
      expect(stat('Upvotes')).toBeUndefined();
      expect(stat('Clicks')).toBeUndefined();
      expect(action('Upvote')).toBeUndefined();
      expect($('[aria-busy]')).toBeNull();
      expect($('[role="alert"]')).toBeNull();
    });

    it('keeps the actions in the footer slot', () => {
      open();

      expect(
        actions().map((el) => el.textContent?.replace(/\s+/g, ' ').trim())
      ).toEqual([
        'View code (opens in a new tab)',
        'Visit website (opens in a new tab)',
      ]);
    });

    it('renders the preview image as decorative', () => {
      open();

      const img = $<HTMLImageElement>('img')!;
      expect(img.src).toBe('https://example.com/tailwind.png');
      expect(img.getAttribute('alt')).toBe('');
    });

    it('leaves out the image and the tag list when the resource has none', () => {
      open({ ...RESOURCE, image: undefined, tags: undefined });

      expect($('img')).toBeNull();
      expect($('ul[aria-label="Tags"]')).toBeNull();
    });
  });

  describe('links', () => {
    it('opens both links in a new tab safely', () => {
      open();

      const website = action('Visit website') as HTMLAnchorElement;
      const repository = action('View code') as HTMLAnchorElement;

      expect(website.href).toBe('https://tailwindcss.com/');
      expect(repository.href).toBe(
        'https://github.com/tailwindlabs/tailwindcss'
      );
      [website, repository].forEach((a) => {
        expect(a.target).toBe('_blank');
        expect(a.rel).toContain('noopener');
        expect(a.querySelector('.sr-only')?.textContent).toContain(
          'opens in a new tab'
        );
      });
    });

    it('leaves out the links the resource does not have', () => {
      open({ ...RESOURCE, url: '', repository: undefined });

      expect(action('Visit website')).toBeUndefined();
      expect(action('View code')).toBeUndefined();
    });
  });

  describe('added date', () => {
    it('shows the month and year in a time element with the ISO date', () => {
      open({ ...RESOURCE, added: '2026-03-15' });

      const time = $<HTMLTimeElement>('time')!;
      expect(time.textContent?.trim()).toBe('March 2026');
      expect(time.getAttribute('datetime')).toBe('2026-03-15');
    });

    it('keeps the month on the first and last day of a month', () => {
      // The test runner cannot switch the time zone; the real guarantee is
      // Angular parsing date-only strings as local midnight.
      open({ ...RESOURCE, added: '2026-12-01' });
      expect($('time')!.textContent?.trim()).toBe('December 2026');

      TestBed.inject(Dialog).closeAll();
      open({ ...RESOURCE, added: '2026-11-30' });
      expect($('time')!.textContent?.trim()).toBe('November 2026');
    });
  });
});
