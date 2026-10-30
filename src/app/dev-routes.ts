import { Routes } from '@angular/router';

/**
 * Development-only routes. Intentionally empty: this is the version production
 * and test builds use.
 *
 * The `development` configuration in angular.json swaps this file for
 * `dev-routes.development.ts`, which registers the pages. Routes live behind a
 * file replacement instead of an `environment.production` check because the
 * bundler cannot tree-shake a property of an object, so the lazy chunk and the
 * route string would otherwise ship to production.
 */
export const devRoutes: Routes = [];
