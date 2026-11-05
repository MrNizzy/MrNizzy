import { PERFORMANCE_ATTRIBUTE } from '@services/performance-tier.service';

/**
 * The glass utilities live in styles.scss (global styles are part of the test
 * build), so their computed styles can be checked against what the components
 * used before: `bg-surface/60 backdrop-blur-md` and friends.
 */

interface GlassSpec {
  utility: string;
  /** What the raw Tailwind classes used to paint (the reference fill). */
  token: '--ds-surface' | '--ds-canvas';
  alpha: number;
  /** Computed `backdrop-filter` in normal mode. */
  blur: string;
}

const GLASS: GlassSpec[] = [
  { utility: 'glass-panel', token: '--ds-surface', alpha: 60, blur: 'blur(12px)' },
  { utility: 'glass-control', token: '--ds-surface', alpha: 70, blur: 'blur(8px)' },
  { utility: 'glass-field', token: '--ds-surface', alpha: 60, blur: 'none' },
  { utility: 'glass-bar', token: '--ds-canvas', alpha: 80, blur: 'blur(12px)' },
  { utility: 'glass-menu', token: '--ds-canvas', alpha: 95, blur: 'blur(12px)' },
  { utility: 'glass-scrim', token: '--ds-canvas', alpha: 70, blur: 'blur(8px)' },
];

/** Alpha channel of a computed colour; 1 for opaque ones. */
function alphaOf(color: string): number {
  const match = /[/]\s*([\d.]+)\s*\)$/.exec(color);
  return match ? parseFloat(match[1]) : 1;
}

describe('glass surfaces', () => {
  const html = document.documentElement;
  let stage: HTMLElement;

  const make = (className: string, style = ''): HTMLElement => {
    const element = document.createElement('div');
    element.className = className;
    element.style.cssText = style;
    stage.appendChild(element);
    return element;
  };
  const fill = (element: HTMLElement) => getComputedStyle(element).backgroundColor;
  const blur = (element: HTMLElement) => getComputedStyle(element).backdropFilter;

  beforeEach(() => {
    html.removeAttribute(PERFORMANCE_ATTRIBUTE);
    html.setAttribute('data-theme', 'dark');
    stage = document.createElement('div');
    document.body.appendChild(stage);
  });

  afterEach(() => {
    stage.remove();
    html.removeAttribute(PERFORMANCE_ATTRIBUTE);
    html.removeAttribute('data-theme');
  });

  describe('in normal mode', () => {
    for (const { utility, token, alpha, blur: expectedBlur } of GLASS) {
      it(`${utility} paints exactly what ${alpha}% of ${token} did, blur ${expectedBlur}`, () => {
        const glass = make(utility);
        // The colour Tailwind emitted for bg-surface/60 and the like.
        const reference = make(
          '',
          `background-color: color-mix(in oklab, var(${token}) ${alpha}%, transparent)`
        );

        expect(fill(glass)).toBe(fill(reference));
        expect(alphaOf(fill(glass))).toBeCloseTo(alpha / 100, 2);
        expect(blur(glass)).toBe(expectedBlur);
      });
    }

    it('follows the theme', () => {
      const glass = make('glass-panel');
      const dark = fill(glass);

      html.setAttribute('data-theme', 'light');

      expect(fill(glass)).not.toBe(dark);
      expect(alphaOf(fill(glass))).toBeCloseTo(0.6, 2);
    });
  });

  describe('in low-performance mode', () => {
    beforeEach(() => html.setAttribute(PERFORMANCE_ATTRIBUTE, 'low'));

    for (const { utility, token } of GLASS) {
      it(`${utility} is near-opaque with no backdrop blur`, () => {
        const glass = make(utility);

        expect(blur(glass)).toBe('none');
        expect(alphaOf(fill(glass))).toBeGreaterThanOrEqual(0.94);
        expect(alphaOf(fill(glass))).toBeLessThan(1);
        // Still the same theme colour, only denser.
        const reference = make(
          '',
          `background-color: color-mix(in oklab, var(${token}) ${Math.round(alphaOf(fill(glass)) * 100)}%, transparent)`
        );
        expect(fill(glass)).toBe(fill(reference));
      });
    }

    it('never lets more of the background through than normal mode', () => {
      for (const { utility, alpha } of GLASS) {
        expect(
          alphaOf(fill(make(utility))) * 100,
          utility
        ).toBeGreaterThanOrEqual(alpha);
      }
    });

    it('switches every variable at once', () => {
      const style = getComputedStyle(html);

      expect(style.getPropertyValue('--glass-blur').trim()).toBe('none');
      expect(style.getPropertyValue('--glass-blur-soft').trim()).toBe('none');
    });

    it('returns to glass when the attribute goes away (the service never removes it)', () => {
      const glass = make('glass-panel');
      html.removeAttribute(PERFORMANCE_ATTRIBUTE);

      expect(blur(glass)).toBe('blur(12px)');
    });
  });

  describe('for users who ask for less transparency', () => {
    /** Rules of the global stylesheets that sit inside a given @media. */
    function mediaRules(feature: string): CSSMediaRule[] {
      const found: CSSMediaRule[] = [];
      const visit = (rules: CSSRuleList) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSMediaRule && rule.media.mediaText.includes(feature)) {
            found.push(rule);
          }
          const nested = (rule as CSSGroupingRule).cssRules;
          if (nested) visit(nested);
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          visit(sheet.cssRules);
        } catch {
          // Cross-origin sheet (fonts): nothing to read.
        }
      }
      return found;
    }

    it('turns the blur off under prefers-reduced-transparency', ({ skip }) => {
      // Browsers that do not know the feature drop the whole @media rule.
      skip(
        window.matchMedia('(prefers-reduced-transparency)').media === 'not all',
        'prefers-reduced-transparency is not supported by this browser'
      );

      const css = mediaRules('prefers-reduced-transparency')
        .map((rule) => rule.cssText)
        .join('\n');

      expect(css).toContain('--glass-blur: none');
      expect(css).toContain('--glass-blur-soft: none');
      expect(css).toMatch(/--glass-alpha-panel: 9[4-7]%/);
    });
  });
});
