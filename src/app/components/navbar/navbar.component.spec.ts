import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { THEME_STORAGE_KEY } from '@services/theme.service';
import { NavbarComponent } from './navbar.component';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BlankComponent {}

const CLOSE_ANIMATION_MS = 250;

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  const host = () => fixture.nativeElement as HTMLElement;
  const burger = () =>
    host().querySelector<HTMLButtonElement>('button[aria-controls]')!;
  const desktopLinks = () =>
    Array.from(
      host().querySelectorAll<HTMLAnchorElement>('nav[aria-label="Main"] a')
    );
  const menu = () => document.querySelector<HTMLElement>('#mobile-menu');
  const menuLink = (path: string) =>
    menu()!.querySelector<HTMLAnchorElement>(`a[href="${path}"]`)!;

  /** Lets the focus trap settle after the overlay renders or detaches. */
  const settle = () => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  };

  const openMenu = () => {
    burger().click();
    settle();
  };

  const finishClosing = () => {
    tick(CLOSE_ANIMATION_MS);
    settle();
  };

  const pressEscape = () => {
    const target = document.activeElement ?? document.body;
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
  };

  beforeEach(async () => {
    // A known starting theme, whatever the test browser's OS setting is.
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([
          { path: '', component: BlankComponent },
          { path: 'projects', component: BlankComponent },
          { path: 'resources', component: BlankComponent },
          { path: 'contact', component: BlankComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  describe('main navigation', () => {
    it('exposes the main links in a labelled navigation landmark', () => {
      expect(desktopLinks().map((a) => a.textContent?.trim())).toEqual([
        'Home',
        'Projects',
        'Resources',
        'Contact',
      ]);
    });

    it('marks only the active route with aria-current="page"', async () => {
      await router.navigateByUrl('/projects');
      fixture.detectChanges();

      const current = desktopLinks().filter(
        (a) => a.getAttribute('aria-current') === 'page'
      );
      expect(current.length).toBe(1);
      expect(current[0].textContent?.trim()).toBe('Projects');
    });

    it('moves aria-current when the route changes', async () => {
      await router.navigateByUrl('/');
      fixture.detectChanges();
      expect(desktopLinks()[0].getAttribute('aria-current')).toBe('page');

      await router.navigateByUrl('/contact');
      fixture.detectChanges();
      expect(desktopLinks()[0].hasAttribute('aria-current')).toBeFalse();
      expect(desktopLinks()[3].getAttribute('aria-current')).toBe('page');
    });

    it('hides the decorative logo from assistive technology', () => {
      expect(host().querySelector('img')!.getAttribute('alt')).toBe('');
    });
  });

  describe('mobile menu', () => {
    it('starts collapsed with a labelled burger button', () => {
      expect(burger().getAttribute('aria-expanded')).toBe('false');
      expect(burger().getAttribute('aria-label')).toBe('Open menu');
      expect(burger().getAttribute('aria-controls')).toBe('mobile-menu');
      expect(menu()).toBeNull();
    });

    it('toggles aria-expanded and the accessible name when opened', fakeAsync(() => {
      openMenu();

      expect(burger().getAttribute('aria-expanded')).toBe('true');
      expect(burger().getAttribute('aria-label')).toBe('Close menu');
      expect(menu()).not.toBeNull();

      pressEscape();
      finishClosing();
      flush();
    }));

    it('renders the links in a labelled nav inside a modal dialog', fakeAsync(() => {
      openMenu();

      expect(menu()!.getAttribute('role')).toBe('dialog');
      expect(menu()!.getAttribute('aria-modal')).toBe('true');
      expect(menu()!.getAttribute('aria-label')).toBe('Menu');

      const nav = menu()!.querySelector('nav')!;
      expect(nav.getAttribute('aria-label')).toBe('Main');
      expect(nav.hasAttribute('role')).toBeFalse();
      expect(nav.querySelectorAll('a').length).toBe(4);

      pressEscape();
      finishClosing();
      flush();
    }));

    it('moves focus into the menu when it opens', fakeAsync(() => {
      openMenu();

      expect(menu()!.contains(document.activeElement)).toBeTrue();

      pressEscape();
      finishClosing();
      flush();
    }));

    it('marks the active route with aria-current inside the menu', fakeAsync(() => {
      router.navigateByUrl('/resources');
      tick();
      openMenu();

      const current = Array.from(
        menu()!.querySelectorAll('a[aria-current="page"]')
      );
      expect(current.length).toBe(1);
      expect(current[0].textContent?.trim()).toBe('Resources');

      pressEscape();
      finishClosing();
      flush();
    }));

    it('closes on Escape and returns focus to the burger', fakeAsync(() => {
      openMenu();

      pressEscape();
      // The exit animation keeps the dialog mounted but no longer "expanded".
      fixture.detectChanges();
      expect(menu()).not.toBeNull();
      expect(burger().getAttribute('aria-expanded')).toBe('false');

      finishClosing();

      expect(menu()).toBeNull();
      expect(document.activeElement).toBe(burger());
    }));

    it('closes with the close button and returns focus to the burger', fakeAsync(() => {
      openMenu();

      menu()!
        .querySelector<HTMLButtonElement>('button[aria-label="Close menu"]')!
        .click();
      finishClosing();

      expect(menu()).toBeNull();
      expect(burger().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(burger());
    }));

    it('closes when a link is clicked, and still navigates', fakeAsync(() => {
      openMenu();

      menuLink('/projects').click();
      tick();
      finishClosing();

      expect(router.url).toBe('/projects');
      expect(menu()).toBeNull();
      expect(burger().getAttribute('aria-expanded')).toBe('false');
    }));

    it('can be reopened after closing', fakeAsync(() => {
      openMenu();
      pressEscape();
      finishClosing();

      openMenu();
      expect(menu()).not.toBeNull();
      expect(burger().getAttribute('aria-expanded')).toBe('true');

      pressEscape();
      finishClosing();
      flush();
    }));
  });

  describe('theme toggle', () => {
    const headerToggle = () =>
      host().querySelector<HTMLButtonElement>('app-theme-toggle button')!;
    const menuToggle = () =>
      menu()!.querySelector<HTMLButtonElement>('app-theme-toggle button')!;

    it('sits in the header, labelled with the action it performs', () => {
      expect(headerToggle().getAttribute('aria-label')).toBe(
        'Switch to light theme'
      );
    });

    it('is only shown from the md breakpoint up, where the burger is hidden', () => {
      const wrapper = host().querySelector('app-theme-toggle')!;

      expect(wrapper.classList).toContain('hidden');
      expect(wrapper.classList).toContain('md:flex');
    });

    it('switches the theme from the header', () => {
      headerToggle().click();
      fixture.detectChanges();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(headerToggle().getAttribute('aria-label')).toBe(
        'Switch to dark theme'
      );
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('is also inside the mobile menu', fakeAsync(() => {
      openMenu();

      expect(menuToggle().getAttribute('aria-label')).toBe(
        'Switch to light theme'
      );

      pressEscape();
      finishClosing();
      flush();
    }));

    it('switches the theme from the menu without closing it', fakeAsync(() => {
      openMenu();

      menuToggle().click();
      settle();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(menuToggle().getAttribute('aria-label')).toBe(
        'Switch to dark theme'
      );
      expect(menu()).not.toBeNull();
      expect(burger().getAttribute('aria-expanded')).toBe('true');

      pressEscape();
      finishClosing();
      flush();
    }));
  });
});
