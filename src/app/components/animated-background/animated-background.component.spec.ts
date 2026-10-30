import { ComponentFixture, TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from '@services/theme.service';
import * as THREE from 'three';

import { AnimatedBackgroundComponent } from './animated-background.component';

/** The private three.js state the specs inspect. */
interface BackgroundInternals {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  particles: THREE.Points;
}

describe('AnimatedBackgroundComponent', () => {
  let component: AnimatedBackgroundComponent;
  let fixture: ComponentFixture<AnimatedBackgroundComponent>;
  let systemDark: boolean;
  let reducedMotion: boolean;

  const internals = () => component as unknown as BackgroundInternals;
  const material = () => internals().particles.material as THREE.PointsMaterial;
  const geometry = () => internals().particles.geometry as THREE.BufferGeometry;
  const firstColor = () => {
    const colors = geometry().getAttribute('color') as THREE.BufferAttribute;
    return [colors.getX(0), colors.getY(0), colors.getZ(0)];
  };

  function create(): void {
    fixture = TestBed.createComponent(AnimatedBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    systemDark = true;
    reducedMotion = false;
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');

    const realMatchMedia = window.matchMedia.bind(window);
    spyOn(window, 'matchMedia').and.callFake((query: string) => {
      if (query.includes('prefers-color-scheme')) {
        return {
          matches: systemDark,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList;
      }
      if (query.includes('prefers-reduced-motion')) {
        return {
          matches: reducedMotion,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList;
      }
      return realMatchMedia(query);
    });

    await TestBed.configureTestingModule({
      imports: [AnimatedBackgroundComponent],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
  });

  it('should create', () => {
    create();

    expect(component).toBeTruthy();
  });

  describe('theme', () => {
    it('keeps the original full-strength particles in dark', () => {
      create();

      expect(material().opacity).toBe(1);
      expect(geometry().drawRange.count).toBe(100);
    });

    it('starts with the lighter particles when the theme is light', () => {
      systemDark = false;
      create();

      expect(material().opacity).toBeLessThan(0.5);
      expect(geometry().drawRange.count).toBeLessThan(100);
    });

    it('restyles the same particles when the theme changes at runtime', () => {
      create();
      const scene = internals().scene;
      const particles = internals().particles;
      const darkColor = firstColor();
      const theme = TestBed.inject(ThemeService);

      theme.setPreference('light');
      fixture.detectChanges();

      expect(material().opacity).toBeLessThan(0.5);
      expect(geometry().drawRange.count).toBeLessThan(100);
      expect(firstColor()).not.toEqual(darkColor);

      theme.setPreference('dark');
      fixture.detectChanges();

      expect(material().opacity).toBe(1);
      expect(geometry().drawRange.count).toBe(100);
      expect(firstColor()).toEqual(darkColor);

      // Same scene, same points: nothing was rebuilt.
      expect(internals().scene).toBe(scene);
      expect(internals().particles).toBe(particles);
    });

    it('flags the colour buffer for upload when the theme changes', () => {
      create();
      const colors = geometry().getAttribute('color') as THREE.BufferAttribute;
      const versionBefore = colors.version;

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(colors.version).toBeGreaterThan(versionBefore);
    });
  });

  describe('reduced motion', () => {
    it('animates on a loop by default', () => {
      const raf = spyOn(window, 'requestAnimationFrame').and.callThrough();

      create();

      expect(raf).toHaveBeenCalled();
    });

    it('does not start the animation loop', () => {
      reducedMotion = true;
      const raf = spyOn(window, 'requestAnimationFrame').and.callThrough();

      create();

      expect(raf).not.toHaveBeenCalled();
    });

    it('still repaints a frame when the theme changes', () => {
      reducedMotion = true;
      create();
      const render = spyOn(internals().renderer, 'render').and.callThrough();

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(render).toHaveBeenCalled();
      expect(material().opacity).toBeLessThan(0.5);
    });
  });
});
