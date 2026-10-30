import { ComponentFixture, TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from '@services/theme.service';
import * as THREE from 'three';

import { AnimatedBackgroundComponent } from './animated-background.component';
import {
  CAMERA_POSITION,
  FOG_FAR_RATIO,
  FOG_NEAR_RATIO,
  PARALLAX_DROP,
  POINTER_IDLE_MOUSE,
  SAMPLE_FRAMES,
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
  tideDepth,
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

/** The slice of WebGLRenderer the component touches, for specs without a GPU. */
function createFakeRenderer() {
  return {
    domElement: document.createElement('canvas'),
    setClearColor: jasmine.createSpy('setClearColor'),
    setPixelRatio: jasmine.createSpy('setPixelRatio'),
    setSize: jasmine.createSpy('setSize'),
    render: jasmine.createSpy('render'),
    dispose: jasmine.createSpy('dispose'),
    forceContextLoss: jasmine.createSpy('forceContextLoss'),
  };
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
  let createRenderer: jasmine.Spy;
  let requestFrame: jasmine.Spy;
  let cancelFrame: jasmine.Spy;
  let systemDark: boolean;
  let coarsePointer: boolean;
  let motion: {
    matches: boolean;
    addEventListener: jasmine.Spy;
    removeEventListener: jasmine.Spy;
  };

  const internals = () => component as unknown as BackgroundInternals;
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

    motion = {
      matches: false,
      addEventListener: jasmine.createSpy('motion add'),
      removeEventListener: jasmine.createSpy('motion remove'),
    };
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
    createRenderer = spyOn(
      AnimatedBackgroundComponent.prototype as unknown as RendererFactory,
      'createRenderer'
    ).and.callFake(() => renderer as unknown as THREE.WebGLRenderer);

    requestFrame = spyOn(window, 'requestAnimationFrame').and.returnValue(42);
    cancelFrame = spyOn(window, 'cancelAnimationFrame');

    await TestBed.configureTestingModule({
      imports: [AnimatedBackgroundComponent],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--ds-canvas');
  });

  it('should create', () => {
    create();

    expect(component).toBeTruthy();
    expect(renderer.domElement.isConnected).toBeTrue();
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
      createRenderer.and.throwError('Error creating WebGL context.');

      expect(() => create()).not.toThrow();
      expect(requestFrame).not.toHaveBeenCalled();
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('adds its listeners on init and removes the same ones on destroy', () => {
      const windowAdd = spyOn(window, 'addEventListener').and.callThrough();
      const windowRemove = spyOn(
        window,
        'removeEventListener'
      ).and.callThrough();
      const documentAdd = spyOn(document, 'addEventListener').and.callThrough();
      const documentRemove = spyOn(
        document,
        'removeEventListener'
      ).and.callThrough();
      const rootAdd = spyOn(
        document.documentElement,
        'addEventListener'
      ).and.callThrough();
      const rootRemove = spyOn(
        document.documentElement,
        'removeEventListener'
      ).and.callThrough();

      create();
      const self = internals();
      const expected: [jasmine.Spy, jasmine.Spy, string, unknown][] = [
        [windowAdd, windowRemove, 'resize', self.onResize],
        [windowAdd, windowRemove, 'scroll', self.onScroll],
        [windowAdd, windowRemove, 'pointermove', self.onPointerMove],
        [windowAdd, windowRemove, 'pointerdown', self.onPointerDown],
        [rootAdd, rootRemove, 'pointerleave', self.onPointerLeave],
      ];
      const wasAdded = (add: jasmine.Spy, type: string, handler: unknown) =>
        add.calls.allArgs().some(([t, h]) => t === type && h === handler);
      for (const [add, , type, handler] of expected) {
        expect(wasAdded(add, type, handler))
          .withContext(`${type} added`)
          .toBeTrue();
      }
      const visibilityHandler = documentAdd.calls
        .allArgs()
        .find(([type]) => type === 'visibilitychange')?.[1] as EventListener;
      expect(visibilityHandler)
        .withContext('visibilitychange added')
        .toEqual(jasmine.any(Function));
      expect(motion.addEventListener).toHaveBeenCalledWith(
        'change',
        jasmine.any(Function)
      );

      fixture.destroy();

      for (const [, remove, type, handler] of expected) {
        expect(remove)
          .withContext(`${type} removed`)
          .toHaveBeenCalledWith(type, handler);
      }
      expect(documentRemove).toHaveBeenCalledWith(
        'visibilitychange',
        visibilityHandler
      );
      expect(motion.removeEventListener).toHaveBeenCalledWith(
        'change',
        motion.addEventListener.calls.mostRecent().args[1]
      );
    });

    it('cancels the loop and releases the GPU objects on destroy', () => {
      create();
      const { geometry, material } = tide();
      const disposeGeometry = spyOn(geometry, 'dispose').and.callThrough();
      const disposeMaterial = spyOn(material, 'dispose').and.callThrough();
      expect(internals().animationFrameId).toBe(42);

      fixture.destroy();

      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(disposeGeometry).toHaveBeenCalled();
      expect(disposeMaterial).toHaveBeenCalled();
      expect(renderer.dispose).toHaveBeenCalled();
      expect(renderer.forceContextLoss).toHaveBeenCalled();
      expect(renderer.domElement.isConnected).toBeFalse();
    });

    it('stops reacting to events after destroy', () => {
      create();
      fixture.destroy();
      renderer.render.calls.reset();

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

      expect(geometry.isInstancedBufferGeometry).toBeTrue();
      // A whole number of rows, and more than one of them.
      expect(geometry.instanceCount % cols).toBe(0);
      expect(geometry.instanceCount).toBeGreaterThan(cols);
      // A single quad, with no per-instance attributes to keep up to date.
      expect(geometry.attributes['position'].count).toBe(4);
      expect(Object.keys(geometry.attributes)).toEqual(['position']);
      expect((mesh as { isInstancedMesh?: boolean }).isInstancedMesh).toBeFalsy();
    });
  });

  describe('context loss', () => {
    it('stops drawing while the context is lost and resumes once restored', () => {
      create();
      const lost = new Event('webglcontextlost', { cancelable: true });

      renderer.domElement.dispatchEvent(lost);

      // preventDefault is what lets the browser restore the context.
      expect(lost.defaultPrevented).toBeTrue();
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.calls.reset();
      renderer.domElement.dispatchEvent(new Event('webglcontextrestored'));

      expect(requestFrame).toHaveBeenCalledTimes(1);
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

      expect(requestFrame).toHaveBeenCalled();
      expect(internals().animationFrameId).toBe(42);
    });

    it('draws one still frame and does not start the loop', () => {
      motion.matches = true;

      create();

      expect(requestFrame).not.toHaveBeenCalled();
      expect(internals().animationFrameId).toBeNull();
      expect(renderer.render).toHaveBeenCalled();
      expect(uniforms().uTime.value).toBe(STILL_TIME);
      expect(uniforms().uPointerStrength.value).toBe(0);
    });

    it('repaints the still frame when the theme changes', () => {
      motion.matches = true;
      create();
      renderer.render.calls.reset();

      TestBed.inject(ThemeService).setPreference('light');
      fixture.detectChanges();

      expect(renderer.render).toHaveBeenCalled();
      expect(hex(uniforms().uMid.value)).toBe(TIDE_PALETTES.light.mid);
    });

    it('repaints the still frame when the window is resized', () => {
      motion.matches = true;
      create();
      renderer.render.calls.reset();

      window.dispatchEvent(new Event('resize'));

      expect(renderer.render).toHaveBeenCalledTimes(1);
      expect(requestFrame).not.toHaveBeenCalled();
    });

    it('starts and stops the loop when the preference flips', () => {
      create();
      const onChange = motion.addEventListener.calls.mostRecent().args[1] as () => void;

      motion.matches = true;
      onChange();
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.calls.reset();
      motion.matches = false;
      onChange();
      expect(requestFrame).toHaveBeenCalledTimes(1);
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
      spyOnProperty(document, 'hidden', 'get').and.callFake(() => hidden);
    });

    it('pauses the loop while the document is hidden and resumes after', () => {
      create();
      expect(internals().animationFrameId).toBe(42);

      setHidden(true);
      expect(cancelFrame).toHaveBeenCalledWith(42);
      expect(internals().animationFrameId).toBeNull();

      requestFrame.calls.reset();
      setHidden(false);
      expect(requestFrame).toHaveBeenCalledTimes(1);
      expect(internals().animationFrameId).toBe(42);
    });

    it('does not start the loop when the page loads hidden', () => {
      hidden = true;

      create();

      expect(requestFrame).not.toHaveBeenCalled();
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
      now += 60_000;
      internals().update(now);

      expect(uniforms().uTime.value - before).toBeLessThan(0.1);
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
      spyOnProperty(window, 'scrollY', 'get').and.returnValue(y);
      spyOnProperty(
        document.documentElement,
        'scrollHeight',
        'get'
      ).and.returnValue(window.innerHeight + range);
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
      const [width, height] = renderer.setSize.calls.mostRecent().args;

      expect(uniforms().uCols.value).toBe(tideColumns(width / height));
    });

    it('draws fewer rows on touch and low-power devices', () => {
      coarsePointer = true;
      create();
      const cols = uniforms().uCols.value;

      expect(tide().geometry.instanceCount).toBe(cols * TIDE_ROWS_COMPACT);
      expect(renderer.setPixelRatio.calls.mostRecent().args[0]).toBeLessThanOrEqual(
        1.5
      );
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

  describe('quality', () => {
    it('keeps full quality while frames come in at 60 fps', () => {
      create();

      advance(WARMUP_FRAMES + SAMPLE_FRAMES * 3);

      expect(internals().qualityLevel).toBe(0);
    });

    it('steps the pixel ratio, then the row count, down when frames stay slow', () => {
      create();
      const full = tide().geometry.instanceCount;

      advance(WARMUP_FRAMES + SAMPLE_FRAMES + 1, 60);
      expect(internals().qualityLevel).toBe(1);
      expect(renderer.setPixelRatio.calls.mostRecent().args[0]).toBe(1);
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
    beforeEach(() => {
      if (!isWebGlAvailable()) {
        pending('WebGL is not available in this browser');
        return;
      }
      createRenderer.and.callThrough();
    });

    it('compiles the shaders and paints pixels onto a transparent canvas', () => {
      const errors = spyOn(console, 'error');
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

      expect(painted).withContext('painted pixels').toBeGreaterThan(0);
      expect(clear).withContext('transparent pixels').toBeGreaterThan(0);
      expect(gl.getError()).toBe(gl.NO_ERROR);
    });
  });
});
