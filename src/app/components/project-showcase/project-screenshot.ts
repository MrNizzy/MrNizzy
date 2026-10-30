import type { Project } from '@pages/home/data';

/**
 * Pixel widths of the WebP renditions generated next to every screenshot
 * (`<name>-480.webp`, `<name>-960.webp`). 960 covers the card at 2x density.
 */
export const SCREENSHOT_WIDTHS: readonly number[] = [480, 960];

/**
 * Rendered width of the screenshot inside a project card: the card padding is
 * already taken out, and the card is half the page width from 768px up (the
 * page container stops growing at 1040px).
 */
export const SCREENSHOT_SIZES =
  '(min-width: 1040px) 424px, (min-width: 768px) calc(50vw - 95px), calc(100vw - 84px)';

export interface ScreenshotSources {
  /** The largest rendition, for the rare browser that ignores `srcset`. */
  src: string;
  srcset: string;
}

/** Derives the WebP renditions of a project's first screenshot from its path. */
export function screenshotSources(
  project: Pick<Project, 'images' | 'screenshotWidths'>
): ScreenshotSources {
  const base = project.images[0].replace(/\.[^./]+$/, '');
  const widths = [...(project.screenshotWidths ?? SCREENSHOT_WIDTHS)].sort(
    (a, b) => a - b
  );
  const rendition = (width: number) => `${base}-${width}.webp`;

  return {
    src: rendition(widths[widths.length - 1]),
    srcset: widths.map((width) => `${rendition(width)} ${width}w`).join(', '),
  };
}
