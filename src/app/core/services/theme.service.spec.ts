import { TestBed } from '@angular/core/testing';
import {
  LIGHT_THEME_ENABLED,
  LIGHT_THEME_ENABLED_TOKEN,
  THEME_STORAGE_KEY,
  ThemeService,
} from './theme.service';

interface FakeMediaQuery {
  matches: boolean;
  addEventListener: jasmine.Spy;
  removeEventListener: jasmine.Spy;
}

describe('ThemeService', () => {
  let systemDark: boolean;
  let mediaListeners: ((event: MediaQueryListEvent) => void)[];

  const root = () => document.documentElement;

  function createService(lightEnabled: boolean): ThemeService {
    TestBed.configureTestingModule({
      providers: [{ provide: LIGHT_THEME_ENABLED_TOKEN, useValue: lightEnabled }],
    });
    return TestBed.inject(ThemeService);
  }

  function emitSystemChange(matches: boolean): void {
    mediaListeners.forEach((listener) =>
      listener({ matches } as MediaQueryListEvent)
    );
  }

  beforeEach(() => {
    systemDark = true;
    mediaListeners = [];
    localStorage.removeItem(THEME_STORAGE_KEY);
    root().removeAttribute('data-theme');

    spyOn(window, 'matchMedia').and.callFake(() => {
      const query: FakeMediaQuery = {
        matches: systemDark,
        addEventListener: jasmine
          .createSpy('addEventListener')
          .and.callFake(
            (_type: string, listener: (event: MediaQueryListEvent) => void) =>
              mediaListeners.push(listener)
          ),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      };
      return query as unknown as MediaQueryList;
    });
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    root().removeAttribute('data-theme');
  });

  it('ships with the light theme enabled', () => {
    expect(LIGHT_THEME_ENABLED).toBeTrue();
    expect(TestBed.inject(LIGHT_THEME_ENABLED_TOKEN)).toBeTrue();
  });

  describe('with the shipped configuration', () => {
    it('follows an OS that prefers light', () => {
      systemDark = false;
      const service = TestBed.inject(ThemeService);

      expect(service.lightThemeEnabled).toBeTrue();
      expect(service.preference()).toBe('system');
      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
    });

    it('follows an OS that prefers dark', () => {
      const service = TestBed.inject(ThemeService);

      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });

    it('honours an explicit stored light choice on a dark OS', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      const service = TestBed.inject(ThemeService);

      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
    });

    it('honours an explicit stored dark choice on a light OS', () => {
      systemDark = false;
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      const service = TestBed.inject(ThemeService);

      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('with the light theme disabled', () => {
    it('is dark even when the OS prefers light', () => {
      systemDark = false;
      const service = createService(false);

      expect(service.lightThemeEnabled).toBeFalse();
      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });

    it('is dark even when the stored preference is light', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      const service = createService(false);

      expect(service.preference()).toBe('light');
      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });

    it('stays dark after the preference changes', () => {
      const service = createService(false);

      service.setPreference('light');

      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('with the light theme enabled', () => {
    it('defaults to the system preference (dark)', () => {
      const service = createService(true);

      expect(service.preference()).toBe('system');
      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });

    it('defaults to the system preference (light)', () => {
      systemDark = false;
      const service = createService(true);

      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
    });

    it('follows OS changes while the preference is system', () => {
      const service = createService(true);
      expect(service.resolved()).toBe('dark');

      emitSystemChange(false);

      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
    });

    it('ignores OS changes once the preference is explicit', () => {
      const service = createService(true);
      service.setPreference('dark');

      emitSystemChange(false);

      expect(service.resolved()).toBe('dark');
      expect(root().getAttribute('data-theme')).toBe('dark');
    });

    it('applies and persists an explicit preference', () => {
      const service = createService(true);

      service.setPreference('light');
      expect(service.resolved()).toBe('light');
      expect(root().getAttribute('data-theme')).toBe('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

      service.setPreference('dark');
      expect(service.resolved()).toBe('dark');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

      service.setPreference('system');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    });

    it('restores the stored preference on startup', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      const service = createService(true);

      expect(service.preference()).toBe('light');
      expect(service.resolved()).toBe('light');
    });

    it('falls back to system when the stored value is invalid', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
      const service = createService(true);

      expect(service.preference()).toBe('system');
    });

    it('keeps working when localStorage throws', () => {
      spyOn(Storage.prototype, 'getItem').and.throwError('blocked');
      spyOn(Storage.prototype, 'setItem').and.throwError('blocked');
      const service = createService(true);

      expect(service.preference()).toBe('system');
      expect(() => service.setPreference('light')).not.toThrow();
      expect(service.resolved()).toBe('light');
    });
  });
});
