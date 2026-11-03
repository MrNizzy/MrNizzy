import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  PERFORMANCE_ATTRIBUTE,
  PERFORMANCE_SIGNALS,
  PERFORMANCE_STORAGE_KEY,
} from '@services/performance-tier.service';
import { THEME_STORAGE_KEY } from '@services/theme.service';

import { appConfig } from './app.config';

describe('appConfig', () => {
  const html = document.documentElement;

  function reset(): void {
    html.removeAttribute(PERFORMANCE_ATTRIBUTE);
    html.removeAttribute('data-theme');
    sessionStorage.removeItem(PERFORMANCE_STORAGE_KEY);
    localStorage.removeItem(THEME_STORAGE_KEY);
  }

  beforeEach(reset);
  afterEach(reset);

  it('applies the low-performance mode before the first render', async () => {
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        // A weak device, whatever runs the specs.
        { provide: PERFORMANCE_SIGNALS, useValue: { deviceMemory: 2 } },
      ],
    });

    // Only the app initializers run here: nothing injects the service itself,
    // so the attribute can come from the initializer alone.
    await TestBed.inject(ApplicationInitStatus).donePromise;

    expect(html.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe('low');
  });
});
