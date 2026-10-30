/**
 * Single source of truth for the inline SVG icons used across the app.
 *
 * Paths were collected from the templates that used to inline them, so icons
 * look the same after migrating. An entry without `stroke` is drawn as a
 * filled shape; an entry with `stroke` is drawn as an outline of that width.
 * Everything uses `currentColor`.
 */
export interface IconDefinition {
  /** SVG viewBox the path was authored for. */
  readonly viewBox: string;
  /** Path data (`d` attribute). */
  readonly path: string;
  /** Stroke width for outline icons. Omit for filled icons. */
  readonly stroke?: number;
  /** Optional SVG transform, used to derive rotated variants of one shape. */
  readonly transform?: string;
}

const MATERIAL_VIEW_BOX = '0 0 24 24';

/**
 * The chevron shape authored on a 1024 grid (previously inlined in the
 * not-found page). Its visual centre is (565, 512); the left and down variants
 * rotate around that point so the whole family shares one outline.
 */
const CHEVRON_VIEW_BOX = '0 0 1024 1024';
const CHEVRON_PATH =
  'M338.752 104.704a64 64 0 0 0 0 90.496l316.8 316.8l-316.8 316.8a64 64 0 0 0 90.496 90.496l362.048-362.048a64 64 0 0 0 0-90.496L429.248 104.704a64 64 0 0 0-90.496 0';

export const ICONS = {
  'external-link': {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M9.367 2.25H9.4a.75.75 0 0 1 0 1.5c-1.132 0-1.937 0-2.566.052c-.62.05-1.005.147-1.31.302a3.25 3.25 0 0 0-1.42 1.42c-.155.305-.251.69-.302 1.31c-.051.63-.052 1.434-.052 2.566v5.2c0 1.133 0 1.937.052 2.566c.05.62.147 1.005.302 1.31a3.25 3.25 0 0 0 1.42 1.42c.305.155.69.251 1.31.302c.63.051 1.434.052 2.566.052h5.2c1.133 0 1.937 0 2.566-.052c.62-.05 1.005-.147 1.31-.302a3.25 3.25 0 0 0 1.42-1.42c.155-.305.251-.69.302-1.31c.051-.63.052-1.434.052-2.566v-1.1a.75.75 0 0 1 1.5 0v1.133c0 1.092 0 1.958-.057 2.655c-.058.714-.18 1.317-.46 1.869a4.75 4.75 0 0 1-2.076 2.075c-.552.281-1.155.403-1.869.461c-.697.057-1.563.057-2.655.057H9.367c-1.092 0-1.958 0-2.655-.057c-.714-.058-1.317-.18-1.868-.46a4.75 4.75 0 0 1-2.076-2.076c-.281-.552-.403-1.155-.461-1.869c-.057-.697-.057-1.563-.057-2.655V9.367c0-1.092 0-1.958.057-2.655c.058-.714.18-1.317.46-1.868a4.75 4.75 0 0 1 2.077-2.076c.55-.281 1.154-.403 1.868-.461c.697-.057 1.563-.057 2.655-.057M13.5 3a.75.75 0 0 1 .75-.75H21a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V4.81l-6.97 6.97a.75.75 0 1 1-1.06-1.06l6.97-6.97h-4.94A.75.75 0 0 1 13.5 3',
  },
  'arrow-up-right': {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M7 17 17 7M8 7h9v9',
    stroke: 2,
  },
  mail: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  },
  copy: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
  },
  check: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
  close: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  },
  menu: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    stroke: 1.5,
  },
  sun: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z',
    stroke: 1.5,
  },
  moon: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z',
    stroke: 1.5,
  },
  'chevron-right': {
    viewBox: CHEVRON_VIEW_BOX,
    path: CHEVRON_PATH,
  },
  'chevron-left': {
    viewBox: CHEVRON_VIEW_BOX,
    path: CHEVRON_PATH,
    transform: 'rotate(180 565 512)',
  },
  'chevron-down': {
    viewBox: CHEVRON_VIEW_BOX,
    path: CHEVRON_PATH,
    transform: 'rotate(90 565 512)',
  },
  'map-pin': {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  },
  search: {
    viewBox: MATERIAL_VIEW_BOX,
    path: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  },
  github: {
    viewBox: '0 0 16 16',
    path: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z',
  },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];
