import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  LIGHT_THEME_ENABLED_TOKEN,
  THEME_STORAGE_KEY,
  ThemeService,
} from '@services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let service: ThemeService;
  let systemDark: boolean;

  const root = () => document.documentElement;
  const button = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button'
    );
  const iconPath = () =>
    (fixture.nativeElement as HTMLElement)
      .querySelector('svg path')!
      .getAttribute('d');

  function create(lightEnabled = true): void {
    TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: LIGHT_THEME_ENABLED_TOKEN, useValue: lightEnabled },
      ],
    });
    service = TestBed.inject(ThemeService);
    fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    systemDark = true;
    localStorage.removeItem(THEME_STORAGE_KEY);
    root().removeAttribute('data-theme');
    spyOn(window, 'matchMedia').and.callFake(
      () =>
        ({
          matches: systemDark,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList
    );
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    root().removeAttribute('data-theme');
  });

  it('is an icon button that does not submit forms', () => {
    create();

    expect(button()!.getAttribute('type')).toBe('button');
    expect(button()!.querySelector('svg')!.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  describe('accessible name', () => {
    it('offers the light theme while the resolved theme is dark', () => {
      create();

      expect(button()!.getAttribute('aria-label')).toBe(
        'Switch to light theme'
      );
    });

    it('offers the dark theme while the resolved theme is light', () => {
      systemDark = false;
      create();

      expect(button()!.getAttribute('aria-label')).toBe('Switch to dark theme');
    });

    it('follows the theme when something else changes it', () => {
      create();

      service.setPreference('light');
      fixture.detectChanges();

      expect(button()!.getAttribute('aria-label')).toBe('Switch to dark theme');
    });
  });

  describe('icon', () => {
    it('shows the sun while dark and the moon while light', () => {
      create();
      const sun = iconPath();

      button()!.click();
      fixture.detectChanges();
      const moon = iconPath();

      expect(sun).toContain('M12 3v2.25');
      expect(moon).toContain('M21.752 15.002');
      expect(sun).not.toBe(moon);
    });
  });

  describe('behavior', () => {
    it('stays on the system preference until it is clicked', () => {
      create();

      expect(service.preference()).toBe('system');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    });

    it('switches a dark theme to light and persists the choice', () => {
      create();

      button()!.click();
      fixture.detectChanges();

      expect(service.preference()).toBe('light');
      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('switches a light theme to dark and persists the choice', () => {
      systemDark = false;
      create();

      button()!.click();
      fixture.detectChanges();

      expect(service.preference()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    });

    it('toggles back and forth', () => {
      create();

      button()!.click();
      fixture.detectChanges();
      button()!.click();
      fixture.detectChanges();

      expect(service.resolved()).toBe('dark');
      expect(button()!.getAttribute('aria-label')).toBe(
        'Switch to light theme'
      );
    });

    it('resumes a stored explicit choice', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      create();

      expect(button()!.getAttribute('aria-label')).toBe('Switch to dark theme');
    });
  });

  it('renders nothing when the light theme is disabled', () => {
    create(false);

    expect(button()).toBeNull();
  });
});
