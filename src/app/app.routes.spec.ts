import { routes } from './app.routes';
import { devRoutes } from './dev-routes';
import { devRoutes as developmentRoutes } from './dev-routes.development';

describe('routes', () => {
  const paths = () => routes.map((route) => route.path);

  it('keeps the wildcard last so it never shadows another route', () => {
    expect(paths().at(-1)).toBe('**');
    expect(paths().filter((path) => path === '**').length).toBe(1);
  });

  it('serves the public pages', () => {
    expect(paths()).toEqual(
      jasmine.arrayContaining([
        '',
        'about',
        'contact',
        'projects',
        'resources',
        'privacy',
      ])
    );
  });

  describe('development-only routes', () => {
    it('are empty in the default build used by production', () => {
      expect(devRoutes).toEqual([]);
      expect(paths()).not.toContain('ui-kit');
    });

    it('register the ui-kit page in the development replacement', () => {
      expect(developmentRoutes.map((route) => route.path)).toEqual(['ui-kit']);
    });

    it('lazy-load the ui-kit page', async () => {
      const component = await developmentRoutes[0].loadComponent?.();

      expect(component).toBeDefined();
    });
  });
});
