import { Routes } from '@angular/router';
import { environment } from '@env/environment';

/** Replaces `dev-routes.ts` in the `development` build configuration only. */
export const devRoutes: Routes = [
  {
    path: 'ui-kit',
    loadComponent: () =>
      import('@pages/ui-kit/ui-kit.component').then((m) => m.UiKitComponent),
    title: `UI Kit - ${environment.appName}`,
  },
];
