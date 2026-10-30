import type { ResolvedTheme } from '@services/theme.service';

/** Colours of the tide for one theme (sRGB hex). */
export interface TidePalette {
  /** Lowest water. */
  readonly trough: number;
  readonly mid: number;
  /** Highest water. */
  readonly crest: number;
  /** Fallback for the page canvas colour when `--ds-canvas` cannot be read. */
  readonly canvas: number;
  /** How much of the ramp survives against the canvas, 0 to 1. */
  readonly intensity: number;
}

/**
 * Dark is the approved ramp on the dark canvas, eased 10% toward it so the
 * subtlest meta text (`text-fg-subtle`) keeps 4.5:1 on average where the tide
 * is strongest. Light is a soft pastel ramp at low intensity, so it reads as a
 * faint texture that stays well behind text: the strongest crest still leaves
 * about 5:1 for muted body text (`text-fg-muted`) over the light canvas.
 */
export const TIDE_PALETTES: Record<ResolvedTheme, TidePalette> = {
  dark: {
    trough: 0x3b1d6e,
    mid: 0x7c3aed,
    crest: 0xec2c7a,
    canvas: 0x121212,
    intensity: 0.9,
  },
  light: {
    trough: 0xe9d5ff,
    mid: 0xf9a8d4,
    crest: 0xf472b6,
    canvas: 0xf7f7f8,
    intensity: 0.4,
  },
};

/** CSS custom property that holds the page canvas colour on `<html>`. */
export const CANVAS_CSS_VARIABLE = '--ds-canvas';

// --- Grid ------------------------------------------------------------------

/** Distance between two pixel centres, in world units. */
export const TIDE_GAP = 0.62;
/** Side of a pixel at rest. */
export const TIDE_PIXEL_SIZE = 0.42;
/** World z of the front row. Past the bottom edge, so pixels bleed off it. */
export const TIDE_FRONT_Z = 6;
/** Rows of pixels, front to back. */
export const TIDE_ROWS = 44;
/** Rows on small screens and low-power devices. */
export const TIDE_ROWS_COMPACT = 32;
/** Fewest and most columns drawn. */
export const TIDE_COLS_MIN = 24;
export const TIDE_COLS_MAX = 140;
/**
 * Columns per unit of viewport aspect ratio: enough to span the view at the
 * far rows (2 * tan(fov / 2) * ~39 units / TIDE_GAP). A tall phone screen needs
 * a third of what a wide monitor does, which is most of the saving on mobile.
 */
const TIDE_COLS_PER_ASPECT = 58.7;

/** Columns that cover the view for a given aspect ratio. */
export function tideColumns(aspect: number): number {
  const wanted = Math.ceil(aspect * TIDE_COLS_PER_ASPECT) + 2;
  return Math.min(TIDE_COLS_MAX, Math.max(TIDE_COLS_MIN, wanted));
}

// --- Camera ----------------------------------------------------------------

export const CAMERA_FOV = 50;
export const CAMERA_POSITION = { x: 0, y: 7.5, z: 16 } as const;
export const CAMERA_TARGET = { x: 0, y: 0, z: -6 } as const;
/**
 * Slides the whole picture down by this share of the viewport height (a lens
 * shift, so the perspective is unchanged). It parks the tide in the lower
 * part of the screen and leaves the top half, where the navbar and the hero
 * heading live, to the plain canvas.
 */
export const VIEW_SHIFT = 0.3;
/** Idle side-to-side sway of the camera. */
export const SWAY_AMPLITUDE = 0.8;
export const SWAY_SPEED = 0.15;
/** Scroll parallax at the end of the page: how far the camera drops... */
export const PARALLAX_DROP = 1.2;
/** ...and how far the look-at point moves back. */
export const PARALLAX_LOOK_BACK = 3;
/** How quickly the camera follows the scroll position (per second). */
export const PARALLAX_EASE = 3;

/**
 * View depth of the water at world z, for the camera's resting pose: how far
 * the point is along the camera's line of sight, which is what the fog uses.
 */
export function tideDepth(z: number): number {
  const towardY = CAMERA_TARGET.y - CAMERA_POSITION.y;
  const towardZ = CAMERA_TARGET.z - CAMERA_POSITION.z;
  const length = Math.hypot(towardY, towardZ);
  return (
    (-CAMERA_POSITION.y * towardY + (z - CAMERA_POSITION.z) * towardZ) / length
  );
}

// --- Fog -------------------------------------------------------------------

/** Fog starts at this share of the farthest row's view depth... */
export const FOG_NEAR_RATIO = 0.4;
/** ...and has swallowed the row at this share. */
export const FOG_FAR_RATIO = 1;

// --- Pointer ---------------------------------------------------------------

/** Seconds a mouse ripple lingers after the cursor stops moving. */
export const POINTER_IDLE_MOUSE = 3;
/** Seconds a tap ripple lasts. */
export const POINTER_IDLE_TOUCH = 0.9;
/** Easing rates (per second) of the ripple strength, in and out. */
export const POINTER_EASE_IN = 6;
export const POINTER_EASE_OUT = 2.5;

// --- Quality ---------------------------------------------------------------

/** Pixel ratio cap on desktop and on compact devices. */
export const DPR_CAP = 2;
export const DPR_CAP_COMPACT = 1.5;
/** Frames ignored while shaders compile, then frames per measurement. */
export const WARMUP_FRAMES = 30;
export const SAMPLE_FRAMES = 90;
/** Average frame time (seconds) above which quality steps down. */
export const SLOW_FRAME_SECONDS = 0.034;
/** Share of the rows kept after the last quality step. */
export const ROWS_REDUCED_SHARE = 0.7;

/** Scene time (seconds) of the single frame drawn under reduced motion. */
export const STILL_TIME = 12;
/** Longest step the scene clock advances in one frame (seconds). */
export const MAX_FRAME_STEP = 0.1;

export const COMPACT_MAX_WIDTH = 768;
