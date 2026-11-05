/**
 * Responsive variants of the profile photo, generated from the lossless
 * `public/mrnizzy.png` master. Every `<picture>` shows the photo at a different
 * size, so each one binds these sources and sets its own `sizes`.
 */
export const PROFILE_PHOTO = {
  avifSrcset:
    'mrnizzy-96.avif 96w, mrnizzy-192.avif 192w, mrnizzy-320.avif 320w, mrnizzy-640.avif 640w',
  webpSrcset:
    'mrnizzy-96.webp 96w, mrnizzy-192.webp 192w, mrnizzy-320.webp 320w, mrnizzy-640.webp 640w',
  /**
   * Used only when the browser takes neither `<source>`. Every browser that
   * runs this app decodes WebP, so no PNG fallback is needed.
   */
  fallbackSrc: 'mrnizzy-320.webp',
} as const;
