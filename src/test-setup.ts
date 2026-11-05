/**
 * Shared setup for the Vitest unit tests (see angular.json).
 */

// Jasmine removed every spy after each spec; Vitest keeps them until asked.
afterEach(() => {
  vi.restoreAllMocks();
});
