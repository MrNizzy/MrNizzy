import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ThemeService } from '@services/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    // Instantiate early so data-theme is applied before the first render.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
