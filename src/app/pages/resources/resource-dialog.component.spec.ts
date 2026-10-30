import { Dialog } from '@angular/cdk/dialog';
import { ApplicationRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UiDialog } from '@shared/ui/dialog/dialog.service';
import { ResourceApi } from './resource-api';
import {
  ResourceDialogComponent,
  type ResourceDialogData,
} from './resource-dialog.component';
import type { Resource } from './resource.model';

const RESOURCE: Resource = {
  resource_id: 'res-1',
  name: 'Tailwind CSS',
  url: 'https://tailwindcss.com',
  url_image: 'https://example.com/tailwind.png',
  url_repository: 'https://github.com/tailwindlabs/tailwindcss',
  description: 'A utility-first CSS framework.',
  type: 'library',
  category: 'styling',
  tags: ['css', 'utility-first'],
  click_count: 10,
  upvotes: 5,
  view_count: 100,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-02-01'),
};

describe('ResourceDialogComponent', () => {
  let http: HttpTestingController;
  let api: ResourceApi;
  let appRef: ApplicationRef;

  const container = () =>
    document.querySelector<HTMLElement>('.cdk-dialog-container');
  const $ = <T extends Element = HTMLElement>(selector: string) =>
    container()?.querySelector<T>(selector) ?? null;
  const buttons = () =>
    Array.from(
      container()?.querySelectorAll<HTMLElement>('button, a') ?? []
    );
  const action = (text: string) =>
    buttons().find((el) => el.textContent?.replace(/\s+/g, ' ').trim().startsWith(text));
  const stat = (label: string) =>
    Array.from(container()?.querySelectorAll('dt') ?? [])
      .find((dt) => dt.textContent?.trim() === label)
      ?.nextElementSibling?.textContent?.trim();

  const detailRequest = (): TestRequest =>
    http.expectOne((r) => r.url.endsWith('/api/resources/res-1'));

  async function settle(): Promise<void> {
    TestBed.tick();
    await appRef.whenStable();
    TestBed.tick();
  }

  function open(
    data: ResourceDialogData = { id: 'res-1', name: 'Tailwind CSS' }
  ): void {
    TestBed.inject(UiDialog).open<void, ResourceDialogData, ResourceDialogComponent>(
      ResourceDialogComponent,
      { data }
    );
    // Only render: the details request is still open, so the app is not stable yet.
    TestBed.tick();
    TestBed.tick();
  }

  async function openLoaded(resource: Resource = RESOURCE): Promise<void> {
    open();
    detailRequest().flush(resource);
    await settle();
  }

  /** Stops a clicked link from navigating the test runner away. */
  function neverNavigate(): void {
    container()
      ?.querySelectorAll('a')
      .forEach((a) => a.addEventListener('click', (e) => e.preventDefault()));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ResourceApi);
    spyOn(api, 'view').and.resolveTo();
    spyOn(api, 'upvote').and.resolveTo();
    spyOn(api, 'click').and.resolveTo();
    http = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  describe('layout', () => {
    it('uses the design system dialog titled with the resource name', async () => {
      await openLoaded();

      expect($('app-ui-dialog')).not.toBeNull();
      expect($('h2')?.textContent?.trim()).toBe('Tailwind CSS');
      expect($('[aria-label="Close dialog"]')).not.toBeNull();
    });

    it('shows the name as title while the details load, with a busy status', async () => {
      open();

      expect($('h2')?.textContent?.trim()).toBe('Tailwind CSS');
      expect($('[aria-busy="true"]')).not.toBeNull();
      expect($('[role="status"]')?.textContent).toContain('Loading resource');
      expect(action('Upvote')).toBeUndefined();
      expect(action('Visit website')).toBeUndefined();
    });

    it('shows the details once loaded', async () => {
      await openLoaded();

      expect($('[aria-busy]')).toBeNull();
      expect(container()?.textContent).toContain('A utility-first CSS framework.');
      expect(
        Array.from(container()!.querySelectorAll('ul[aria-label="Tags"] li')).map(
          (li) => li.textContent?.trim()
        )
      ).toEqual(['css', 'utility-first']);
      expect(stat('Type')).toBe('library');
      expect(stat('Category')).toBe('styling');
      expect(stat('Upvotes')).toBe('5');
      expect(stat('Clicks')).toBe('10');
    });

    it('keeps the actions in the footer slot', async () => {
      await openLoaded();

      const footer = $('footer')!;
      expect(
        Array.from(footer.querySelectorAll('button, a')).map((el) =>
          el.textContent?.replace(/\s+/g, ' ').trim()
        )
      ).toEqual([
        'Upvote',
        'View repository (opens in a new tab)',
        'Visit website (opens in a new tab)',
      ]);
    });

    it('has no custom backdrop, animation classes or inline keyframes of its own', async () => {
      await openLoaded();

      const html = container()!.innerHTML;
      expect(html).not.toMatch(/animate-(?:fade-in|scale-in|pop)|bg-black|white\//);
      expect(
        document.querySelectorAll('[aria-label="Close modal backdrop"]').length
      ).toBe(0);
    });
  });

  describe('view tracking', () => {
    it('records exactly one view when the dialog opens', async () => {
      open();
      detailRequest().flush(RESOURCE);
      await settle();
      await settle();

      expect(api.view).toHaveBeenCalledOnceWith('res-1');
    });

    it('reflects the view optimistically in the count', async () => {
      await openLoaded();

      expect(stat('Views')).toBe('101');
    });

    it('logs and carries on when recording the view fails', async () => {
      const error = spyOn(console, 'error');
      (api.view as jasmine.Spy).and.rejectWith(new Error('offline'));

      await openLoaded();

      expect(error).toHaveBeenCalledWith(
        'Failed to record view',
        jasmine.any(Error)
      );
      expect(stat('Views')).toBe('101');
    });
  });

  describe('upvote', () => {
    it('calls the API with the resource id and bumps the count', async () => {
      await openLoaded();

      action('Upvote')!.click();
      await settle();

      expect(api.upvote).toHaveBeenCalledOnceWith('res-1');
      expect(stat('Upvotes')).toBe('6');
    });

    it('confirms politely for screen readers, and again on every upvote', async () => {
      await openLoaded();
      const live = $('p[role="status"][aria-live="polite"]')!;
      expect(live.textContent?.trim()).toBe('');
      expect(live.getAttribute('aria-atomic')).toBe('true');

      action('Upvote')!.click();
      await settle();
      expect(live.textContent?.trim()).toBe(
        'Thanks for the upvote. 6 upvotes in total.'
      );

      action('Upvote')!.click();
      await settle();
      expect(live.textContent?.trim()).toBe(
        'Thanks for the upvote. 7 upvotes in total.'
      );
      expect(api.upvote).toHaveBeenCalledTimes(2);
    });

    it('no longer relies on a pop animation', async () => {
      await openLoaded();

      action('Upvote')!.click();
      await settle();

      expect(action('Upvote')!.className).not.toMatch(/animate-/);
    });

    it('logs and keeps the optimistic count when the request fails', async () => {
      const error = spyOn(console, 'error');
      (api.upvote as jasmine.Spy).and.rejectWith(new Error('offline'));
      await openLoaded();

      action('Upvote')!.click();
      await settle();

      expect(error).toHaveBeenCalledWith('Failed to upvote', jasmine.any(Error));
      expect(stat('Upvotes')).toBe('6');
    });
  });

  describe('links and click tracking', () => {
    it('opens both links in a new tab safely', async () => {
      await openLoaded();

      const website = action('Visit website') as HTMLAnchorElement;
      const repository = action('View repository') as HTMLAnchorElement;

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

    it('tracks a click on the website link', async () => {
      await openLoaded();
      neverNavigate();

      action('Visit website')!.click();
      await settle();

      expect(api.click).toHaveBeenCalledOnceWith('res-1');
      expect(stat('Clicks')).toBe('11');
    });

    it('tracks a click on the repository link', async () => {
      await openLoaded();
      neverNavigate();

      action('View repository')!.click();
      await settle();

      expect(api.click).toHaveBeenCalledOnceWith('res-1');
      expect(stat('Clicks')).toBe('11');
    });

    it('does not track clicks on the other actions', async () => {
      await openLoaded();

      action('Upvote')!.click();
      await settle();

      expect(api.click).not.toHaveBeenCalled();
    });

    it('logs and keeps the optimistic count when tracking a click fails', async () => {
      const error = spyOn(console, 'error');
      (api.click as jasmine.Spy).and.rejectWith(new Error('offline'));
      await openLoaded();
      neverNavigate();

      action('Visit website')!.click();
      await settle();

      expect(error).toHaveBeenCalledWith(
        'Failed to track click',
        jasmine.any(Error)
      );
      expect(stat('Clicks')).toBe('11');
    });

    it('leaves out the links the resource does not have', async () => {
      await openLoaded({ ...RESOURCE, url: '', url_repository: '' });

      expect(action('Visit website')).toBeUndefined();
      expect(action('View repository')).toBeUndefined();
      expect(action('Upvote')).toBeDefined();
    });
  });

  describe('error', () => {
    it('says what happened and offers to try again', async () => {
      open();
      detailRequest().flush('boom', { status: 500, statusText: 'Server Error' });
      await settle();

      const alert = $('[role="alert"]')!;
      expect(alert.textContent).toContain("Couldn't load this resource");
      expect(alert.textContent).toContain('(500)');
      expect(action('Try again')).toBeDefined();
      expect(action('Upvote')).toBeUndefined();
    });

    it('fetches the details again on "Try again"', async () => {
      open();
      detailRequest().error(new ProgressEvent('error'));
      await settle();
      expect($('[role="alert"]')?.textContent).toContain(
        "The server couldn't be reached."
      );

      action('Try again')!.click();
      TestBed.tick();
      detailRequest().flush(RESOURCE);
      await settle();

      expect($('[role="alert"]')).toBeNull();
      expect(action('Upvote')).toBeDefined();
      expect(stat('Type')).toBe('library');
      // Retrying is not a new visit.
      expect(api.view).toHaveBeenCalledTimes(1);
    });
  });
});
