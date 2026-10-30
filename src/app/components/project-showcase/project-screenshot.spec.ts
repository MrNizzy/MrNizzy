import { screenshotSources } from './project-screenshot';

describe('screenshotSources', () => {
  it('derives the WebP renditions from the original path', () => {
    expect(
      screenshotSources({ images: ['./screenshots/invessoft.png'] })
    ).toEqual({
      src: './screenshots/invessoft-960.webp',
      srcset:
        './screenshots/invessoft-480.webp 480w, ./screenshots/invessoft-960.webp 960w',
    });
  });

  it('handles JPEG originals and underscores in the name', () => {
    const { src } = screenshotSources({ images: ['./screenshots/a_b.jpg'] });

    expect(src).toBe('./screenshots/a_b-960.webp');
  });

  it('only uses the first image', () => {
    const { srcset } = screenshotSources({
      images: ['./screenshots/one.png', './screenshots/two.png'],
    });

    expect(srcset).not.toContain('two');
  });

  it('uses the widths declared by the project instead of the defaults', () => {
    expect(
      screenshotSources({
        images: ['./screenshots/ninja_frog.png'],
        screenshotWidths: [508],
      })
    ).toEqual({
      src: './screenshots/ninja_frog-508.webp',
      srcset: './screenshots/ninja_frog-508.webp 508w',
    });
  });

  it('lists the widths in ascending order whatever the declared order', () => {
    const { src, srcset } = screenshotSources({
      images: ['./screenshots/x.png'],
      screenshotWidths: [800, 400],
    });

    expect(srcset).toBe(
      './screenshots/x-400.webp 400w, ./screenshots/x-800.webp 800w'
    );
    expect(src).toBe('./screenshots/x-800.webp');
  });
});
