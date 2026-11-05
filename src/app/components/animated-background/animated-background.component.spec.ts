import type { Mock } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PERFORMANCE_ATTRIBUTE,
  PERFORMANCE_SIGNALS,
  PERFORMANCE_STORAGE_KEY,
  PerformanceTierService,
} from '@services/performance-tier.service';
import { THEME_STORAGE_KEY, ThemeService } from '@services/theme.service';
import * as THREE from 'three';

import { AnimatedBackgroundComponent } from './animated-background.component';
import {
  CAMERA_POSITION,
  FOG_FAR_RATIO,
  FOG_NEAR_RATIO,
  LOW_PERFORMANCE_FRAME_SECONDS,
  PARALLAX_DROP,
  POINTER_IDLE_MOUSE,
  SAMPLE_FRAMES,
  SLOW_FRAME_SECONDS,
  STALL_FRAME_SECONDS,
  STILL_TIME,
  TIDE_COLS_MAX,
  TIDE_COLS_MIN,
  TIDE_FRONT_Z,
  TIDE_GAP,
  TIDE_PALETTES,
  TIDE_ROWS,
  TIDE_ROWS_COMPACT,
  WARMUP_FRAMES,
  tideColumns,
  tideContextAttributes,
  tideDepth,
  tideRendererOptions,
} from './tide.config';

/** The private state the specs inspect and drive. */
interface BackgroundInternals {
  tide: {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    geometry: THREE.InstancedBufferGeometry;
    material: THREE.ShaderMaterial;
    mesh: THREE.Mesh;
    uniforms: {
      uTime: THREE.IUniform<number>;
      uPointer: THREE.IUniform<THREE.Vector3>;
      uPointerStrength: THREE.IUniform<number>;
      uCols: THREE.IUniform<number>;
      uTrough: THREE.IUniform<THREE.Color>;
      uMid: THREE.IUniform<THREE.Color>;
      uCrest: THREE.IUniform<THREE.Color>;
      uFogColor: THREE.IUniform<THREE.Color>;
      uFogRange: THREE.IUniform<THREE.Vector2>;
      uIntensity: THREE.IUniform<number>;
    };
  } | null;
  animationFrameId: number | null;
  animate: FrameRequestCallback;
  qualityLevel: number;
  update(timestamp: number): void;
  renderFrame(): void;
  onResize: () => void;
  onScroll: () => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerDown: (event: PointerEvent) => void;
  onPointerLeave: (event: PointerEvent) => void;
}

interface RendererFactory {
  createRenderer(compact: boolean): THREE.WebGLRenderer;
}

/** One signature of `getContext`, so it can be spied on and faked. */
interface ContextFactory {
  getContext(
    contextId: string,
    attributes?: WebGLContextAttributes
  ): RenderingContext | null;
}

/** The slice of WebGLRenderer the component touches, for specs without a GPU. */
function createFakeRenderer() {
  return {
    domElement: document.createElement('canvas'),
    setClearColor: vi.fn().mockName('setClearColor'),
    setPixelRatio: vi.fn().mockName('setPixelRatio'),
    setSize: vi.fn().mockName('setSize'),
    render: vi.fn().mockName('render'),
    dispose: vi.fn().mockName('dispose'),
    forceContextLoss: vi.fn().mockName('forceContextLoss'),
  };
}

/** Forgets any low-performance decision, in the page and in the session. */
function resetPerformanceTier(): void {
  document.documentElement.removeAttribute(PERFORMANCE_ATTRIBUTE);
  sessionStorage.removeItem(PERFORMANCE_STORAGE_KEY);
}

function isWebGlAvailable(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

describe('AnimatedBackgroundComponent', () => {
  let component: AnimatedBackgroundComponent;
  let fixture: ComponentFixture<AnimatedBackgroundComponent>;
  let renderer: ReturnType<typeof createFakeRenderer>;
  let createRenderer: Mock;
  let requestFrame: Mock;
  let cancelFrame: Mock;
  let systemDark: boolean;
  let coarsePointer: boolean;
  let motion: {
    matches: boolean;
    addEventListener: Mock;
    removeEventListener: Mock;
  };

  const internals = () => component as unknown as BackgroundInternals;
  // Frames requested by the component's own loop. Without zone.js, Angular's
  // zoneless scheduler also calls requestAnimationFrame, so the spy alone
  // cannot tell the two apart.
  const loopFrames = () =>
    requestFrame.mock.calls.filter(
      ([callback]) => callback === internals().animate
    );
  const tide = () => {
    const current = internals().tide;
    if (!current) throw new Error('the tide scene was not created');
    return current;
  };
  const uniforms = () => tide().uniforms;
  const hex = (color: THREE.Color) =>
    color.getHex(THREE.LinearSRGBColorSpace);

  /** Runs `frames` update steps of `stepMs`, as the loop would. */
  let now = 0;
  function advance(frames: number, stepMs = 1000 / 60): void {
    for (let i = 0; i < frames; i++) {
      now += stepMs;
      internals().update(now);
    }
  }

  /**
   * Like `advance`, but every `every`-th frame takes `hitchMs` instead: the
   * occasional hitch (scrolling, image decoding, GC) over a steady cadence.
   */
  function advanceWithHitches(
    frames: number,
    stepMs: number,
    every: number,
    hitchMs: number
  ): void {
    for (let i = 1; i <= frames; i++) {
      now += i % every === 0 ? hitchMs : stepMs;
      internals().update(now);
    }
  }

  function create(): void {
    fixture = TestBed.createComponent(AnimatedBackgroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function pointer(
    type: string,
    init: PointerEventInit = {},
    target: EventTarget = window
  ): void {
    target.dispatchEvent(
      new PointerEvent(type, { pointerType: 'mouse', ...init })
    );
  }

  beforeEach(async () => {
    systemDark = true;
    coarsePointer = false;
    now = 0;
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    resetPerformanceTier();

    motion = {
      matches: false,
      addEventListener: vi.fn().mockName('motion add'),
      removeEventListener: vi.fn().mockName('motion remove'),
    };
    const realMatchMedia = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query.includes('prefers-color-scheme')) {
        return {
          matches: systemDark,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        } as unknown as MediaQueryList;
      }
      if (query.includes('prefers-reduced-motion')) {
        return motion as unknown as MediaQueryList;
      }
      if (query.includes('pointer: coarse')) {
        return {
          matches: coarsePointer,
        } as unknown as MediaQueryList;
      }
      return realMatchMedia(query);
    });

    // No GPU needed: hand the component a stand-in renderer.
    renderer = createFakeRenderer();
    createRenderer = vi
      .spyOn(
        AnimatedBackgroundComponent.prototype as unknown as RendererFactory,
        'createRenderer'
      )
      .mockImplementation(() => renderer as unknown as THREE.WebGLRenderer);

    requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(42);
    cancelFrame = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockReturnValue(undefined);

    await TestBed.configureTestingModule({
      imports: [AnimatedBackgroundComponent],
      // A capable machine, whatever runs the specs: low mode must come from
      // the tide itself here.
      providers: [
        {
          provide: PERFORMANCE_SIGNALS,
          useValue: { deviceMemory: 8, hardwareConcurrency: 8 },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--ds-canvas');
    resetPerformanceTier();
  });

  it('should create', () => {
    create();

    expect(component).toBeTruthy();
    expect(renderer.domElement.isConnected).toBe(true);
  });

  describe('canvas surface', () => {
    it('never takes pointer input and fades out toward the top of the screen', () => {
      create();
      const container = fixture.nativeElement.querySelector(
        '.animated-background-container'
      ) as HTMLElement;
      const style = getComputedStyle(container);

      expect(style.pointerEvents).toBe('none');
      expect(style.position).toBe('fixed');
      expect(container.getAttribute('aria-hidden')).toBe('true');
      // The computed value drops the default "to bottom": clear at the top,
      // fully opaque lower down.
      const mask = style.maskImage || style.webkitMaskImage;
      expect(mask).toContain('linear-gradient');
      expect(mask).toMatch(/rgba\(0, 0, 0, 0\) 0%/);
      expect(mask).toMatch(/rgb\(0, 0, 0\) \d+%/);
    });
  });

  describe('lifecycle', () => {
    it('does not throw when destroyed before init', () => {
      fixture = TestBed.createComponent(AnimatedBackgroundComponent);

      expect(() => fixture.destroy()).not.toThrow();
      expect(createRenderer).not.toHaveBeenCalled();
    });

    it('survives a machine without WebGL', () => {
      createRenderer.mockImplementation(() => {
        throw new Error('Error creating WebGL context.');
      });

      expect(() => create()).not.toThrow();
      expect(loopFrames()).toHaveLength(0);
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('switches to low-performance mode when WebGL is missing or software only', () => {
      createRenderer.mockImplementation(() => {
        throw new Error('Error creating WebGL context.');
      });

      create();

      const tier = TestBed.inject(PerformanceTierService);
      expect(tier.reason()).toBe('no-hardware-webgl');
      expect(document.documentElement.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        'low'
      );
    });

    it('stays in normal mode when the renderer starts', () => {
      create();

      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
    });

    it('adds its listeners on init and removes the same ones on destroy', () => {
      const windowAdd = vi.spyOn(window, 'addEventListener');
      const windowRemove = vi.spyOn(window, 'removeEventListener');
      const documentAdd = vi.spyOn(document, 'addEventListener');
      const documentRemove = vi.spyOn(document, 'removeEventListener');
      const rootAdd = vi.spyOn(document.documentElement, 'addEventListener');
      const rootRemove = vi.spyOn(
        document.documentElement,
        'removeEventListener'
      );

      create();
      const self = internals();
      const expected: [Mock, Mock, string, unknown][] = [
        [windowAdd, windowRemove, 'resize', self.onResize],
        [windowAdd, windowRemove, 'scroll', self.onScroll],
        [windowAdd, windowRemove, 'pointermove', self.onPointerMove],
        [windowAdd, windowRemove, 'pointerdown', self.onPointerDown],
        [rootAdd, rootRemove, 'pointerleave', self.onPointerLeave],
      ];
      const wasAdded = (add: Mock, type: string, handler: unknown) =>
        vi.mocked(add).mock.calls.some(([t, h]) => t === type && h === handler);
      for (const [add, , type, handler] of expected) {
        expect(wasAdded(add, type, handler), `${type} added`).toBe(true);
      }
      const visibilityHandler = vi
        .mocked(documentAdd)
        .mock.calls.find(
          ([type]) => type === 'visibilitychange'
        )?.[1] as EventListener;
      expect(visibilityHandler, 'visibilitychange added').toEqual(
        expect.any(Function)
      );
      expect(motion.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );

      fixture.destroy();

      for (const [, remove, type, handler] of expected) {
        expect(remove, `${type} removed`).toHaveBeenCalledWith(type, handler);
      }
      expect(documentRemove).toHaveBeenCalledWith(
        'visibilitychange',
        visibilityHandler
      );
      expect(motion.removeEventListener).toHaveBeenCalledWith(
        'change',
        vi.mocked(motion.addEventListener).mock.lastCall![1]
      );
    });

    it('cancels the loop and releases the GPU objects on destroy', () => {
      create();
      const { geometry, material } = tide();
      const disposeGeometry = vi.spyOn(geometry, 'dispose');
      const disposeMaterial = vi.spyOn(material, 'dispose');
      expect(internals().animationFrameId).toBe(42);

      fixture.destroy();

      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(disposeGeometry).toHaveBeenCalled();
      expect(disposeMaterial).toHaveBeenCalled();
      expect(renderer.dispose).toHaveBeenCalled();
      expect(renderer.forceContextLoss).toHaveBeenCalled();
      expect(renderer.domElement.isConnected).toBe(false);
    });

    it('stops reacting to events after destroy', () => {
      create();
      fixture.destroy();
      renderer.render.mockClear();

      window.dispatchEvent(new Event('resize'));
      pointer('pointermove', { clientX: 10, clientY: 10 });

      expect(renderer.setSize).toHaveBeenCalledTimes(1); // the init call only
      expect(renderer.render).not.toHaveBeenCalled();
    });

    it('is transparent, so the page colour shows through', () => {
      create();

      expect(renderer.setClearColor).toHaveBeenCalledWith(0x000000, 0);
    });

    it('draws all grid cells with one instanced draw and no CPU matrices', () => {
      create();
      const { geometry, mesh } = tide();

      const cols = uniforms().uCols.value;

      expect(geometry.isInstancedBufferGeometry).toBe(true);
      // A whole number of rows, and more than one of them.
      expect(geometry.instanceCount % cols).toBe(0);
      expect(geometry.instanceCount).toBeGreaterThan(cols);
      // A single quad, with no per-instance attributes to keep up to date.
      expect(geometry.attributes['position'].count).toBe(4);
      expect(Object.keys(geometry.attributes)).toEqual(['position']);
      expect(
        (
          mesh as {
            isInstancedMesh?: boolean;
          }
        ).isInstancedMesh
      ).toBeFalsy();
    });
  });

  describe('context loss', () => {
    it('stops drawing while the context is lost and resumes once restored', () => {
      create();
      const lost = new Event('webglcontextlost', { cancelable: true });

      renderer.domElement.dispatchEvent(lost);

      // preventDefault is what lets the browser restore the context.
      expect(lost.defaultPrevented).toBe(true);
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.mockClear();
      renderer.domElement.dispatchEvent(new Event('webglcontextrestored'));

      expect(loopFrames()).toHaveLength(1);
      expect(internals().animationFrameId).toBe(42);
    });
  });

  describe('theme', () => {
    it('starts with the dark ramp on the canvas colour', () => {
      create();

      const { dark } = TIDE_PALETTES;
      expect(hex(uniforms().uTrough.value)).toBe(dark.trough);
      expect(hex(uniforms().uMid.value)).toBe(dark.mid);
      expect(hex(uniforms().uCrest.value)).toBe(dark.crest);
      expect(uniforms().uIntensity.value).toBe(dark.intensity);
      // #121212, read from --ds-canvas.
      expect(hex(uniforms().uFogColor.value)).toBe(0x121212);
    });

    it('starts with the soft ramp when the theme is light', () => {
      systemDark = false;
      create();

      const { light } = TIDE_PALETTES;
      expect(hex(uniforms().uMid.value)).toBe(light.mid);
      expect(uniforms().uIntensity.value).toBeLessThan(0.6);
      expect(hex(uniforms().uFogColor.value)).toBe(0xf7f7f8);
    });

    it('updates the uniforms in place when the theme changes at runtime', () => {
      create();
      const scene = tide();
      const { material, geometry, mesh } = scene;
      const mid = uniforms().uMid.value;
      const theme = TestBed.inject(ThemeService);

      theme.setPreference('light');
      fixture.detectChanges();

      expect(hex(mid)).toBe(TIDE_PALETTES.light.mid);
      expect(hex(uniforms().uFogColor.value)).toBe(0xf7f7f8);
      expect(uniforms().uIntensity.value).toBe(TIDE_PALETTES.light.intensity);

      theme.setPreference('dark');
      fixture.detectChanges();

      expect(hex(mid)).toBe(TIDE_PALETTES.dark.mid);
      expect(hex(uniforms().uFogColor.value)).toBe(0x121212);
      expect(uniforms().uIntensity.value).toBe(TIDE_PALETTES.dark.intensity);

      // Same scene, same material, same geometry: nothing was rebuilt.
      expect(tide()).toBe(scene);
      expect(tide().material).toBe(material);
      expect(tide().geometry).toBe(geometry);
      expect(tide().mesh).toBe(mesh);
    });

    it('takes the fog colour from the page canvas variable', () => {
      create();
      document.documentElement.style.setProperty('--ds-canvas', '#123456');

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(hex(uniforms().uFogColor.value)).toBe(0x123456);
    });

    it('falls back to the palette canvas when the variable is unreadable', () => {
      create();
      document.documentElement.style.setProperty('--ds-canvas', 'not a colour');

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(hex(uniforms().uFogColor.value)).toBe(TIDE_PALETTES.light.canvas);
    });
  });

  describe('reduced motion', () => {
    it('animates on a loop by default', () => {
      create();

      expect(loopFrames().length).toBeGreaterThan(0);
      expect(internals().animationFrameId).toBe(42);
    });

    it('draws one still frame and does not start the loop', () => {
      motion.matches = true;

      create();

      expect(loopFrames()).toHaveLength(0);
      expect(internals().animationFrameId).toBeNull();
      expect(renderer.render).toHaveBeenCalled();
      expect(uniforms().uTime.value).toBe(STILL_TIME);
      expect(uniforms().uPointerStrength.value).toBe(0);
    });

    it('repaints the still frame when the theme changes', () => {
      motion.matches = true;
      create();
      renderer.render.mockClear();

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(renderer.render).toHaveBeenCalled();
      expect(hex(uniforms().uMid.value)).toBe(TIDE_PALETTES.light.mid);
    });

    it('repaints the still frame when the window is resized', () => {
      motion.matches = true;
      create();
      renderer.render.mockClear();

      window.dispatchEvent(new Event('resize'));

      expect(renderer.render).toHaveBeenCalledTimes(1);
      expect(loopFrames()).toHaveLength(0);
    });

    it('starts and stops the loop when the preference flips', () => {
      create();
      const onChange = vi.mocked(motion.addEventListener).mock
        .lastCall![1] as () => void;

      motion.matches = true;
      onChange();
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.mockClear();
      motion.matches = false;
      onChange();
      expect(loopFrames()).toHaveLength(1);
      expect(internals().animationFrameId).toBe(42);
    });
  });

  describe('page visibility', () => {
    let hidden: boolean;

    function setHidden(value: boolean): void {
      hidden = value;
      document.dispatchEvent(new Event('visibilitychange'));
    }

    beforeEach(() => {
      hidden = false;
      vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    });

    it('pauses the loop while the document is hidden and resumes after', () => {
      create();
      expect(internals().animationFrameId).toBe(42);

      setHidden(true);
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.mockClear();
      setHidden(false);
      expect(loopFrames()).toHaveLength(1);
      expect(internals().animationFrameId).toBe(42);
    });

    it('does not start the loop when the page loads hidden', () => {
      hidden = true;

      create();

      expect(loopFrames()).toHaveLength(0);
      expect(internals().animationFrameId).toBeNull();
    });

    it('does not jump the scene clock after a pause', () => {
      create();
      advance(10);
      const before = uniforms().uTime.value;

      setHidden(true);
      setHidden(false);
      // The first frame after resuming is a clean 1/60 s step, whatever the
      // (huge) gap in timestamps.
      now += 60000;
      internals().update(now);

      expect(uniforms().uTime.value - before).toBeLessThan(0.1);
    });

    it('restarts the frame-time measurement when the loop resumes', () => {
      create();

      // Slow frames, two short of a complete sample, then the tab is hidden
      // and shown again, then healthy frames. Had the slow frames been kept,
      // the first two healthy ones would have closed the sample at 59 ms.
      advance(WARMUP_FRAMES + SAMPLE_FRAMES - 2, 60);
      setHidden(true);
      setHidden(false);
      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 2);

      expect(internals().qualityLevel).toBe(0);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
    });
  });

  describe('pointer', () => {
    /** Aims at the lower part of the screen, where the water is. */
    const overWater = () => ({
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight * 0.9,
    });

    it('ripples under the cursor and eases the strength in', () => {
      create();
      expect(uniforms().uPointerStrength.value).toBe(0);

      pointer('pointermove', overWater());
      advance(1);
      const first = uniforms().uPointerStrength.value;
      advance(30);

      expect(first).toBeGreaterThan(0);
      expect(first).toBeLessThan(1);
      expect(uniforms().uPointerStrength.value).toBeGreaterThan(first);
      // Cast onto the water plane, in front of the camera.
      expect(uniforms().uPointer.value.y).toBeCloseTo(0, 5);
      expect(uniforms().uPointer.value.z).toBeLessThan(CAMERA_POSITION.z);
    });

    it('eases the ripple out when the pointer leaves the page', () => {
      create();
      pointer('pointermove', overWater());
      advance(60);
      const raised = uniforms().uPointerStrength.value;
      expect(raised).toBeGreaterThan(0.9);

      pointer('pointerleave', {}, document.documentElement);
      advance(5);
      const easing = uniforms().uPointerStrength.value;
      expect(easing).toBeLessThan(raised);
      expect(easing).toBeGreaterThan(0);

      advance(240);
      expect(uniforms().uPointerStrength.value).toBe(0);
    });

    it('lets the ripple settle when the cursor rests', () => {
      create();
      pointer('pointermove', overWater());
      advance(60);
      expect(uniforms().uPointerStrength.value).toBeGreaterThan(0.9);

      advance(Math.ceil((POINTER_IDLE_MOUSE + 5) * 60));

      expect(uniforms().uPointerStrength.value).toBe(0);
    });

    it('ignores a pointer aimed above the horizon', () => {
      create();

      pointer('pointermove', { clientX: window.innerWidth / 2, clientY: 4 });
      advance(30);

      expect(uniforms().uPointerStrength.value).toBe(0);
    });

    it('ripples touch only on a tap, not while dragging', () => {
      create();

      pointer('pointermove', { ...overWater(), pointerType: 'touch' });
      advance(30);
      expect(uniforms().uPointerStrength.value).toBe(0);

      pointer('pointerdown', { ...overWater(), pointerType: 'touch' });
      // The finger lifting must not cut the tap short.
      pointer('pointerleave', { pointerType: 'touch' }, document.documentElement);
      advance(15);
      expect(uniforms().uPointerStrength.value).toBeGreaterThan(0.3);

      advance(240);
      expect(uniforms().uPointerStrength.value).toBe(0);
    });
  });

  describe('scroll parallax', () => {
    const scrollTo = (y: number, range = 1000) => {
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(y);
      vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(
        window.innerHeight + range
      );
      window.dispatchEvent(new Event('scroll'));
    };

    it('lowers the camera as the page scrolls, easing toward the target', () => {
      create();
      advance(5);
      const resting = tide().camera.position.y;
      expect(resting).toBeCloseTo(CAMERA_POSITION.y, 1);

      scrollTo(1000);
      advance(4);
      const early = tide().camera.position.y;
      advance(400);
      const settled = tide().camera.position.y;

      expect(early).toBeLessThan(resting);
      expect(early).toBeGreaterThan(settled);
      expect(settled).toBeCloseTo(CAMERA_POSITION.y - PARALLAX_DROP, 1);
    });

    it('does not scroll the still frame under reduced motion', () => {
      motion.matches = true;
      create();

      scrollTo(1000);

      expect(tide().camera.position.y).toBe(CAMERA_POSITION.y);
    });
  });

  describe('density', () => {
    it('needs far fewer columns on a tall phone screen than a wide monitor', () => {
      expect(tideColumns(375 / 812)).toBeLessThan(tideColumns(1280 / 800) / 2);
      expect(tideColumns(0.1)).toBe(TIDE_COLS_MIN);
      expect(tideColumns(10)).toBe(TIDE_COLS_MAX);
    });

    it('measures fog depth along the line of sight', () => {
      expect(tideDepth(-20)).toBeGreaterThan(tideDepth(0));
      expect(tideDepth(0)).toBeGreaterThan(tideDepth(10));
    });

    it('matches the columns to the container aspect ratio', () => {
      create();
      const [width, height] = vi.mocked(renderer.setSize).mock.lastCall!;

      expect(uniforms().uCols.value).toBe(tideColumns(width / height));
    });

    it('draws fewer rows on touch and low-power devices', () => {
      coarsePointer = true;
      create();
      const cols = uniforms().uCols.value;

      expect(tide().geometry.instanceCount).toBe(cols * TIDE_ROWS_COMPACT);
      expect(
        vi.mocked(renderer.setPixelRatio).mock.lastCall![0]
      ).toBeLessThanOrEqual(1.5);
    });

    it('never draws fewer rows than the compact tier', () => {
      create();
      const cols = uniforms().uCols.value;

      expect(tide().geometry.instanceCount).toBeGreaterThanOrEqual(
        cols * TIDE_ROWS_COMPACT
      );
      expect(tide().geometry.instanceCount).toBeLessThanOrEqual(cols * TIDE_ROWS);
    });

    it('pulls the fog in to the last row that is drawn', () => {
      create();
      const rows = tide().geometry.instanceCount / uniforms().uCols.value;
      const far = uniforms().uFogRange.value;

      const lastRowDepth = tideDepth(TIDE_FRONT_Z - (rows - 1) * TIDE_GAP);
      expect(far.y).toBeCloseTo(lastRowDepth * FOG_FAR_RATIO, 5);
      expect(far.x).toBeCloseTo(lastRowDepth * FOG_NEAR_RATIO, 5);
    });
  });

  describe('renderer options', () => {
    it('refuses a software renderer, so a weak machine keeps a plain page', () => {
      expect(tideRendererOptions(false).failIfMajorPerformanceCaveat).toBe(
        true
      );
      expect(tideRendererOptions(true).failIfMajorPerformanceCaveat).toBe(true);
    });

    it('keeps the transparent canvas and the low-power preference', () => {
      expect(tideRendererOptions(false)).toEqual(
        expect.objectContaining({ alpha: true, powerPreference: 'low-power' })
      );
    });

    it('skips antialiasing on the compact tier only', () => {
      expect(tideRendererOptions(false).antialias).toBe(true);
      expect(tideRendererOptions(true).antialias).toBe(false);
    });

    it('asks the browser to refuse a software-only WebGL context', () => {
      // The real factory, with a browser that has no usable context.
      createRenderer.mockRestore();
      const getContext = vi
        .spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(null);

      expect(() => create()).not.toThrow();

      // Asked once, with the refusal on. A second call without attributes is
      // what three.js makes after a failure, and what builds a software context.
      expect(getContext).toHaveBeenCalledTimes(1);
      expect(getContext).toHaveBeenCalledWith(
        'webgl2',
        expect.objectContaining({ failIfMajorPerformanceCaveat: true })
      );
      // The page stays plain, and the surfaces go solid.
      expect(internals().tide).toBeNull();
      expect(TestBed.inject(PerformanceTierService).reason()).toBe(
        'no-hardware-webgl'
      );
    });

    describe('context attributes', () => {
      it('are the ones three.js would have requested from the same options', () => {
        // three.js r176 (WebGLRenderer.js): its defaults, alpha always on.
        expect(tideContextAttributes(tideRendererOptions(false))).toEqual({
          alpha: true,
          depth: true,
          stencil: false,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: true,
        });
        expect(tideContextAttributes(tideRendererOptions(true))).toEqual(
          expect.objectContaining({ alpha: true, antialias: false })
        );
      });

      it('fall back to three.js defaults for options that are not set', () => {
        expect(tideContextAttributes({})).toEqual({
          alpha: true,
          depth: true,
          stencil: false,
          antialias: false,
          premultipliedAlpha: true,
          preserveDrawingBuffer: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        });
      });
    });
  });

  describe('quality', () => {
    it('orders the thresholds: 30 fps < step-down < low mode < stall', () => {
      const thirtyFps = 1 / 30;

      expect(SLOW_FRAME_SECONDS).toBeGreaterThan(thirtyFps);
      expect(LOW_PERFORMANCE_FRAME_SECONDS).toBeGreaterThan(SLOW_FRAME_SECONDS);
      expect(STALL_FRAME_SECONDS).toBeGreaterThan(LOW_PERFORMANCE_FRAME_SECONDS);
    });

    it('keeps full quality while frames come in at 60 fps', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 3);

      expect(internals().qualityLevel).toBe(0);
      // A healthy device keeps its glass surfaces.
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
    });

    it('switches the page to low-performance mode once a sample of very slow frames closes', () => {
      create();
      const tier = TestBed.inject(PerformanceTierService);
      advance(WARMUP_FRAMES + SAMPLE_FRAMES - 1, 60);
      expect(tier.isLow()).toBe(false);

      advance(2, 60);

      expect(internals().qualityLevel).toBe(1);
      expect(tier.reason()).toBe('slow-frames');
      expect(document.documentElement.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        'low'
      );
      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBe('low');
    });

    it('steps down and goes low for frames at 22 fps, below the low-performance threshold', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 45);

      expect(internals().qualityLevel).toBe(1);
      expect(TestBed.inject(PerformanceTierService).reason()).toBe(
        'slow-frames'
      );
      expect(document.documentElement.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        'low'
      );
    });

    it('steps quality down but keeps the glass for frames between 25 and 30 fps', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 36);

      expect(internals().qualityLevel).toBe(1);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBeNull();
    });

    it('leaves a steady 30 fps cap alone: energy-saving modes keep the glass', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 3, 1000 / 30);

      expect(internals().qualityLevel).toBe(0);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
    });

    it('still counts slow frames that are not stalls: 200 ms frames step down and go low', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 200);

      expect(internals().qualityLevel).toBe(1);
      expect(TestBed.inject(PerformanceTierService).reason()).toBe(
        'slow-frames'
      );
    });

    it('does not mistake a throttled page for a slow one', () => {
      create();

      // A hidden embed or a frozen tab: the page still reports "visible", but a
      // frame arrives about once a second. That is not rendering cost.
      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 3, 1000);

      expect(internals().qualityLevel).toBe(0);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBeNull();
    });

    it('does not count a stall as a frame of the sample', () => {
      create();

      // Healthy frames with a one second pause every fourth frame. Counted,
      // the pauses would fill most of every sample and read as a slow device.
      advanceWithHitches(WARMUP_FRAMES + SAMPLE_FRAMES * 3, 1000 / 60, 4, 1000);

      expect(internals().qualityLevel).toBe(0);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
    });

    it('does not count a stall toward the warm-up or the sample, and does not restart them', () => {
      create();

      // Slow frames, each followed by a pause. The sample closes on the
      // 120th slow frame (30 of warm-up, 90 measured), not before: the pauses
      // are neither frames nor reasons to start over.
      for (let i = 0; i < WARMUP_FRAMES + SAMPLE_FRAMES - 1; i++) {
        advance(1, 60);
        advance(1, 300);
      }
      expect(internals().qualityLevel).toBe(0);

      advance(1, 60);

      expect(internals().qualityLevel).toBe(1);
    });

    it('rides out occasional hitches over a 30 fps cadence: neither a step down nor low', () => {
      create();

      // 33 ms frames with a 200 ms hitch every 20th (4 or 5 per sample): the
      // plain average of a sample reads 40 ms or more, the typical frame 33 ms.
      advanceWithHitches(WARMUP_FRAMES + SAMPLE_FRAMES * 4, 1000 / 30, 20, 200);

      expect(internals().qualityLevel).toBe(0);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(false);
      expect(document.documentElement.hasAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        false
      );
      expect(sessionStorage.getItem(PERFORMANCE_STORAGE_KEY)).toBeNull();
    });

    it('still catches a slow device whose frames come with periodic stalls', () => {
      create();

      // 60 ms frames with a 300 ms pause every 20th frame. A weak phone like
      // this must not be excused by the pauses: they are skipped, the slow
      // frames around them still add up to a sample.
      advanceWithHitches(200, 60, 20, 300);

      expect(internals().qualityLevel).toBe(1);
      expect(TestBed.inject(PerformanceTierService).reason()).toBe(
        'slow-frames'
      );
    });

    it('keeps measuring at the lowest quality, so a device that sinks later still goes low', () => {
      create();
      const tier = TestBed.inject(PerformanceTierService);

      // About 27 fps for two samples: both quality steps, but the glass stays.
      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 2, 37);
      expect(internals().qualityLevel).toBe(2);
      expect(tier.isLow()).toBe(false);

      // Then the device gets worse: the next sample still counts.
      advance(SAMPLE_FRAMES, 60);

      expect(internals().qualityLevel).toBe(2);
      expect(tier.reason()).toBe('slow-frames');
      expect(document.documentElement.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        'low'
      );
    });

    it('stays in low mode when frames recover: no flapping', () => {
      create();
      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 60);
      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(true);

      advance(SAMPLE_FRAMES * 3);

      expect(TestBed.inject(PerformanceTierService).isLow()).toBe(true);
      expect(document.documentElement.getAttribute(PERFORMANCE_ATTRIBUTE)).toBe(
        'low'
      );
    });

    it('steps the pixel ratio, then the row count, down when frames stay slow', () => {
      create();
      const full = tide().geometry.instanceCount;

      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 60);
      expect(internals().qualityLevel).toBe(1);
      expect(vi.mocked(renderer.setPixelRatio).mock.lastCall![0]).toBe(1);
      expect(tide().geometry.instanceCount).toBe(full);

      advance(SAMPLE_FRAMES + 1, 60);
      expect(internals().qualityLevel).toBe(2);
      expect(tide().geometry.instanceCount).toBeLessThan(full);

      // It never goes lower or back up.
      advance(SAMPLE_FRAMES * 3, 60);
      expect(internals().qualityLevel).toBe(2);
    });
  });

  describe('with a real WebGL context', () => {
    beforeEach(({ skip }) => {
      // Same condition the Jasmine suite used to mark these specs as pending.
      skip(!isWebGlAvailable(), 'WebGL is not available in this environment');
      // Same options as the app, minus the software-renderer refusal: the
      // specs run on whatever GL the test browser has, SwiftShader included.
      createRenderer.mockImplementation(
        (compact: boolean) =>
          new THREE.WebGLRenderer({
            ...tideRendererOptions(compact),
            failIfMajorPerformanceCaveat: false,
          })
      );
    });

    it('builds the renderer on the context it requested, without asking again', () => {
      // The real factory. The specs run on SwiftShader, which the refusal would
      // turn away, so lift it on the way through and keep the context.
      createRenderer.mockRestore();
      const original = HTMLCanvasElement.prototype.getContext;
      let requested: RenderingContext | null = null;
      const getContext = vi
        .spyOn(
          HTMLCanvasElement.prototype as unknown as ContextFactory,
          'getContext'
        )
        .mockImplementation(function (
          this: HTMLCanvasElement,
          contextId: string,
          attributes?: WebGLContextAttributes
        ) {
          requested = original.call(this, contextId, {
            ...attributes,
            failIfMajorPerformanceCaveat: false,
          });
          return requested;
        });

      create();

      expect(getContext).toHaveBeenCalledTimes(1);

      expect(getContext).toHaveBeenCalledWith(
        'webgl2',
        expect.objectContaining({
          alpha: true,
          powerPreference: 'low-power',
          failIfMajorPerformanceCaveat: true,
        })
      );
      expect(requested).not.toBeNull();
      expect(tide().renderer.getContext()).toBe(
        requested as unknown as WebGL2RenderingContext
      );
      expect(tide().renderer.domElement).toBe(
        (requested as unknown as WebGL2RenderingContext).canvas as HTMLCanvasElement
      );
      expect(tide().renderer.domElement.isConnected).toBe(true);
    });

    it('compiles the shaders and paints pixels onto a transparent canvas', () => {
      const errors = vi.spyOn(console, 'error').mockReturnValue(undefined);
      create();
      const real = tide().renderer;

      internals().update(16);
      internals().renderFrame();

      // One instanced draw call covering every grid cell.
      expect(real.info.render.calls).toBe(1);
      expect(real.info.render.triangles).toBe(
        tide().geometry.instanceCount * 2
      );
      expect(errors).not.toHaveBeenCalled();

      const gl = real.getContext();
      const { width, height } = gl.canvas as HTMLCanvasElement;
      const data = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
      let painted = 0;
      let clear = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) painted++;
        else clear++;
      }

      expect(painted, 'painted pixels').toBeGreaterThan(0);
      expect(clear, 'transparent pixels').toBeGreaterThan(0);
      expect(gl.getError()).toBe(gl.NO_ERROR);
    });
  });
});
