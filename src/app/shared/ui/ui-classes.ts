/**
 * Class fragments shared by several primitives.
 *
 * Tailwind finds utilities by scanning source files for complete class names,
 * so every entry here must stay a literal, never an interpolated string.
 */

/** Visible keyboard focus: replaces the native outline with a ring. */
export const FOCUS_RING =
  'outline-hidden focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas';

/** Colour transitions, disabled automatically for reduced-motion users. */
export const COLOR_TRANSITION = 'motion-safe:transition-colors duration-150';

/**
 * Surface shared by text fields and the select trigger. The invalid state
 * follows `aria-invalid="true"`, so forms and hand-written bindings both work.
 */
export const FIELD = [
  'w-full rounded-control border border-line bg-surface/60 px-4 py-2.5 text-fg',
  'outline-hidden focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus/40',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40',
  'disabled:cursor-not-allowed disabled:opacity-50',
  COLOR_TRANSITION,
].join(' ');
