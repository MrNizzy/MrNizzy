import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ThemeService } from '@services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // New pages start at the top; back/forward restores the previous position.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    // Instantiate early so data-theme is applied before the first render.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
