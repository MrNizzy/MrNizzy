/**
 * Theme scope an overlay should inherit from the element that opened it.
 *
 * Overlays render in the CDK overlay container at the end of `<body>`, so they
 * sit outside any wrapper that sets its own `data-theme`. ThemeService puts the
 * theme on `<html>`, which every overlay already inherits; this only matters
 * for a nested scope, such as the light preview in the UI kit.
 *
 * @returns the scoped theme name, or `null` when the theme comes from `<html>`.
 */
export function themeScopeOf(origin: Element | null): string | null {
  const scope = origin?.closest('[data-theme]') ?? null;
  if (!scope || scope === origin?.ownerDocument.documentElement) return null;
  return scope.getAttribute('data-theme');
}
