import {
  DestroyRef,
  Injectable,
  InjectionToken,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

/**
 * Kill switch for the light theme. While `false`, the resolved theme is always
 * 'dark' regardless of the stored preference or the OS setting, and the theme
 * toggle hides itself.
 *
 * Keep in sync with the pre-paint script in `src/index.html`. The token CSS in
 * `src/styles.scss` also follows `prefers-color-scheme: light` on its own, so
 * switching this off needs that media block removed as well.
 */
export const LIGHT_THEME_ENABLED = true;

/** Injectable copy of the flag so tests can override it. */
export const LIGHT_THEME_ENABLED_TOKEN = new InjectionToken<boolean>(
  'LIGHT_THEME_ENABLED',
  { providedIn: 'root', factory: () => LIGHT_THEME_ENABLED }
);

export const THEME_STORAGE_KEY = 'theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly lightEnabled = inject(LIGHT_THEME_ENABLED_TOKEN);

  private readonly mediaQuery =
    this.document.defaultView?.matchMedia?.(DARK_QUERY) ?? null;

  private readonly preferenceState = signal<ThemePreference>(
    this.readStoredPreference()
  );
  private readonly systemPrefersDark = signal(this.mediaQuery?.matches ?? true);

  /** Whether the light theme (and so the theme toggle) is available. */
  readonly lightThemeEnabled = this.lightEnabled;

  /** The user's choice: 'system', 'light' or 'dark'. */
  readonly preference = this.preferenceState.asReadonly();

  /** The theme actually applied to the document. */
  readonly resolved = computed<ResolvedTheme>(() => {
    if (!this.lightEnabled) return 'dark';
    const preference = this.preferenceState();
    if (preference === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    this.apply();

    const mediaQuery = this.mediaQuery;
    if (mediaQuery) {
      const onChange = (event: MediaQueryListEvent) => {
        this.systemPrefersDark.set(event.matches);
        this.apply();
      };
      mediaQuery.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() =>
        mediaQuery.removeEventListener('change', onChange)
      );
    }
  }

  setPreference(preference: ThemePreference): void {
    this.preferenceState.set(preference);
    this.persist(preference);
    this.apply();
  }

  private apply(): void {
    this.document.documentElement.setAttribute('data-theme', this.resolved());
  }

  private readStoredPreference(): ThemePreference {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(
        THEME_STORAGE_KEY
      );
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Storage can be unavailable (privacy mode, blocked cookies).
    }
    return 'system';
  }

  private persist(preference: ThemePreference): void {
    try {
      this.document.defaultView?.localStorage.setItem(
        THEME_STORAGE_KEY,
        preference
      );
    } catch {
      // Ignore: the preference still applies for this session.
    }
  }
}
