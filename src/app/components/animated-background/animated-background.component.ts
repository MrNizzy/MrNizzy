import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { ResolvedTheme, ThemeService } from '@services/theme.service';
import * as THREE from 'three';

import {
  CAMERA_FOV,
  CAMERA_POSITION,
  CAMERA_TARGET,
  CANVAS_CSS_VARIABLE,
  COMPACT_MAX_WIDTH,
  DPR_CAP,
  DPR_CAP_COMPACT,
  FOG_FAR_RATIO,
  FOG_NEAR_RATIO,
  MAX_FRAME_STEP,
  PARALLAX_DROP,
  PARALLAX_EASE,
  PARALLAX_LOOK_BACK,
  POINTER_EASE_IN,
  POINTER_EASE_OUT,
  POINTER_IDLE_MOUSE,
  POINTER_IDLE_TOUCH,
  ROWS_REDUCED_SHARE,
  SAMPLE_FRAMES,
  SLOW_FRAME_SECONDS,
  STILL_TIME,
  SWAY_AMPLITUDE,
  SWAY_SPEED,
  TIDE_FRONT_Z,
  TIDE_GAP,
  TIDE_PALETTES,
  TIDE_PIXEL_SIZE,
  TIDE_ROWS,
  TIDE_ROWS_COMPACT,
  VIEW_SHIFT,
  WARMUP_FRAMES,
  tideColumns,
  tideDepth,
} from './tide.config';
import { TIDE_FRAGMENT_SHADER, TIDE_VERTEX_SHADER } from './tide.shaders';

interface TideUniforms {
  // Index signature so the object is assignable to ShaderMaterial's uniforms.
  [uniform: string]: THREE.IUniform;
  uTime: THREE.IUniform<number>;
  uPointer: THREE.IUniform<THREE.Vector3>;
  uPointerStrength: THREE.IUniform<number>;
  uCols: THREE.IUniform<number>;
  uGap: THREE.IUniform<number>;
  uSize: THREE.IUniform<number>;
  uFront: THREE.IUniform<number>;
  uTrough: THREE.IUniform<THREE.Color>;
  uMid: THREE.IUniform<THREE.Color>;
  uCrest: THREE.IUniform<THREE.Color>;
  uFogColor: THREE.IUniform<THREE.Color>;
  uFogRange: THREE.IUniform<THREE.Vector2>;
  uIntensity: THREE.IUniform<number>;
}

/** Everything that needs a GPU context. Absent when WebGL is unavailable. */
interface TideScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly geometry: THREE.InstancedBufferGeometry;
  readonly material: THREE.ShaderMaterial;
  readonly mesh: THREE.Mesh;
  readonly uniforms: TideUniforms;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const COARSE_POINTER_QUERY = '(pointer: coarse)';
const LOW_MEMORY_GB = 4;
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** The water surface, which the pointer is cast onto. */
const WATER_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

/**
 * Writes an sRGB hex colour into `target` without converting it: the shader
 * blends and outputs sRGB as is (see tide.shaders.ts).
 */
function setRawColor(target: THREE.Color, hex: number): void {
  target.setHex(hex, THREE.LinearSRGBColorSpace);
}

/** Small screens, touch devices and low-memory devices get a lighter tide. */
function isCompactDevice(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return (
    window.innerWidth < COMPACT_MAX_WIDTH ||
    (window.matchMedia?.(COARSE_POINTER_QUERY).matches ?? false) ||
    (memory !== undefined && memory <= LOW_MEMORY_GB)
  );
}

/**
 * A grid of small square "pixels" lying on a plane, rising and falling like a
 * tide, seen in perspective from a fixed camera. It is one instanced quad
 * drawn by a custom shader: height, size, colour, fog and the cursor ripple
 * are all computed on the GPU from a few uniforms, and no matrices are
 * updated on the CPU. Everything three.js stays in this lazy chunk.
 *
 * The canvas is transparent: the page colour lives on `<html>` (`--ds-canvas`)
 * and shows through, and the fog fades pixels into that same colour.
 */
@Component({
  selector: 'app-animated-background',
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedBackgroundComponent implements OnInit, OnDestroy {
  private readonly containerRef = viewChild.required<ElementRef<HTMLElement>>(
    'container'
  );
  private readonly theme = inject(ThemeService);
  private readonly motionQuery =
    window.matchMedia?.(REDUCED_MOTION_QUERY) ?? null;

  private tide: TideScene | null = null;
  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private clock = 0;

  private size = { width: 1, height: 1 };
  private compact = false;
  /** 0 = full quality; 1 = lower pixel ratio; 2 = also fewer rows. */
  private qualityLevel = 0;
  private framesSeen = 0;
  private frameSeconds = 0;

  private scrollTarget = 0;
  private scrollEased = 0;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private pointerInside = false;
  private pointerIdleFor = Infinity;
  private pointerIdleLimit = POINTER_IDLE_MOUSE;
  private pointerStrength = 0;

  constructor() {
    // Retint the existing pixels when the theme changes; nothing is rebuilt.
    // Runs before init too, hence the guard in applyTheme.
    effect(() => {
      const theme = this.theme.resolved();
      untracked(() => this.applyTheme(theme));
    });
  }

  ngOnInit() {
    if (!this.initThree()) return;

    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('pointermove', this.onPointerMove, {
      passive: true,
    });
    window.addEventListener('pointerdown', this.onPointerDown, {
      passive: true,
    });
    document.documentElement.addEventListener(
      'pointerleave',
      this.onPointerLeave
    );
    document.addEventListener('visibilitychange', this.syncAnimation);
    this.motionQuery?.addEventListener('change', this.syncAnimation);

    this.onScroll();
    this.scrollEased = this.scrollTarget;
    this.syncAnimation();
  }

  ngOnDestroy() {
    this.stopAnimation();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerdown', this.onPointerDown);
    document.documentElement.removeEventListener(
      'pointerleave',
      this.onPointerLeave
    );
    document.removeEventListener('visibilitychange', this.syncAnimation);
    this.motionQuery?.removeEventListener('change', this.syncAnimation);

    // The component can be destroyed before ngOnInit (e.g. in tests), or
    // after WebGL failed to start.
    const tide = this.tide;
    if (!tide) return;
    this.tide = null;

    const canvas = tide.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.onContextLost);
    canvas.removeEventListener('webglcontextrestored', this.syncAnimation);
    canvas.remove();

    tide.scene.remove(tide.mesh);
    tide.geometry.dispose();
    tide.material.dispose();
    tide.renderer.dispose();
    // Free the GL context now instead of waiting for the garbage collector.
    tide.renderer.forceContextLoss();
  }

  /** Overridable so specs can run without a GPU. */
  protected createRenderer(compact: boolean): THREE.WebGLRenderer {
    return new THREE.WebGLRenderer({
      alpha: true,
      // The squares are axis-aligned and small; skip MSAA where fill is dear.
      antialias: !compact,
      // A decoration should not wake the discrete GPU.
      powerPreference: 'low-power',
    });
  }

  /** Builds the scene. Returns false, leaving the page plain, without WebGL. */
  private initThree(): boolean {
    this.compact = isCompactDevice();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = this.createRenderer(this.compact);
    } catch {
      // No WebGL: the page simply shows its plain canvas colour.
      return false;
    }
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.syncAnimation);
    this.containerRef().nativeElement.appendChild(renderer.domElement);

    const uniforms: TideUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(0, 0, -1000) },
      uPointerStrength: { value: 0 },
      uCols: { value: 1 },
      uGap: { value: TIDE_GAP },
      uSize: { value: TIDE_PIXEL_SIZE },
      uFront: { value: TIDE_FRONT_Z },
      uTrough: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uCrest: { value: new THREE.Color() },
      uFogColor: { value: new THREE.Color() },
      uFogRange: { value: new THREE.Vector2(1, 2) },
      uIntensity: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: TIDE_VERTEX_SHADER,
      fragmentShader: TIDE_FRAGMENT_SHADER,
    });

    // One flat unit quad, drawn once per grid cell. The cell is derived from
    // gl_InstanceID in the shader, so there are no instance attributes.
    const quad = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = quad.index;
    geometry.setAttribute('position', quad.getAttribute('position'));

    const mesh = new THREE.Mesh(geometry, material);
    // The vertex shader moves the pixels, so the quad's bounds are meaningless.
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 200);

    this.tide = { renderer, scene, camera, geometry, material, mesh, uniforms };

    this.resize();
    this.placeCamera(0, 0);
    this.applyTheme(this.theme.resolved());
    return true;
  }

  /** Fits the renderer, camera and grid to the container and the device. */
  private resize() {
    const tide = this.tide;
    if (!tide) return;

    const element = this.containerRef().nativeElement;
    const width = element.clientWidth || window.innerWidth;
    const height = element.clientHeight || window.innerHeight;
    this.size = { width, height };
    this.compact = isCompactDevice();

    this.applyQuality();
    tide.renderer.setSize(width, height);
    // Lens shift: slide the picture down so the tide sits in the lower part
    // of the screen without changing the perspective.
    tide.camera.setViewOffset(
      width,
      height,
      0,
      -Math.round(height * VIEW_SHIFT),
      width,
      height
    );
    this.applyDensity();
  }

  /** Columns, rows and fog depth for the current size and quality. */
  private applyDensity() {
    const tide = this.tide;
    if (!tide) return;

    const baseRows = this.compact ? TIDE_ROWS_COMPACT : TIDE_ROWS;
    const rows = Math.round(
      baseRows * (this.qualityLevel > 1 ? ROWS_REDUCED_SHARE : 1)
    );
    const columns = tideColumns(this.size.width / this.size.height);

    // Instances run front row first, so dropping rows trims the far end.
    tide.uniforms.uCols.value = columns;
    tide.geometry.instanceCount = columns * rows;

    const farthest = tideDepth(TIDE_FRONT_Z - (rows - 1) * TIDE_GAP);
    tide.uniforms.uFogRange.value.set(
      farthest * FOG_NEAR_RATIO,
      farthest * FOG_FAR_RATIO
    );
  }

  /** Applies the pixel ratio for the current device and quality level. */
  private applyQuality() {
    const tide = this.tide;
    if (!tide) return;

    const cap = this.compact ? DPR_CAP_COMPACT : DPR_CAP;
    const wanted = this.qualityLevel > 0 ? 1 : cap;
    tide.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, wanted));
  }

  /** Retints the existing pixels and fog for a theme. */
  private applyTheme(theme: ResolvedTheme) {
    const tide = this.tide;
    if (!tide) return;

    const palette = TIDE_PALETTES[theme];
    const { uniforms } = tide;
    setRawColor(uniforms.uTrough.value, palette.trough);
    setRawColor(uniforms.uMid.value, palette.mid);
    setRawColor(uniforms.uCrest.value, palette.crest);
    uniforms.uIntensity.value = palette.intensity;

    // The fog must match the page canvas exactly, so read it from the page.
    const canvas = getComputedStyle(document.documentElement)
      .getPropertyValue(CANVAS_CSS_VARIABLE)
      .trim();
    if (HEX_COLOR.test(canvas)) {
      uniforms.uFogColor.value.setStyle(canvas, THREE.LinearSRGBColorSpace);
    } else {
      setRawColor(uniforms.uFogColor.value, palette.canvas);
    }

    this.renderStill();
  }

  /** Starts or stops the loop to match reduced motion and page visibility. */
  private readonly syncAnimation = () => {
    if (!this.tide) return;

    if (this.motionQuery?.matches) {
      // One well-composed frame, no loop.
      this.stopAnimation();
      this.resetMotion();
      this.renderFrame();
    } else if (document.hidden) {
      this.stopAnimation();
    } else if (this.animationFrameId === null) {
      this.lastTimestamp = null;
      this.framesSeen = 0;
      this.frameSeconds = 0;
      this.animationFrameId = requestAnimationFrame(this.animate);
    }
  };

  private stopAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Arrow function: one stable reference for requestAnimationFrame.
  private readonly animate = (timestamp: number) => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.update(timestamp);
    this.renderFrame();
  };

  /** Advances the scene by one frame. Touches uniforms and the camera only. */
  private update(timestamp: number) {
    const tide = this.tide;
    if (!tide) return;

    const elapsed =
      this.lastTimestamp === null
        ? 1 / 60
        : (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const step = Math.min(Math.max(elapsed, 0), MAX_FRAME_STEP);

    this.clock += step;
    tide.uniforms.uTime.value = this.clock;

    this.scrollEased +=
      (this.scrollTarget - this.scrollEased) *
      (1 - Math.exp(-step * PARALLAX_EASE));
    this.placeCamera(
      Math.sin(this.clock * SWAY_SPEED) * SWAY_AMPLITUDE,
      this.scrollEased
    );

    this.updatePointer(step);
    this.watchFrameTime(step);
  }

  /**
   * Camera pose from the idle sway and the scroll position (0 to 1): the
   * camera sinks and looks a little farther back as the page scrolls.
   */
  private placeCamera(sway: number, scroll: number) {
    const camera = this.tide?.camera;
    if (!camera) return;

    camera.position.set(
      CAMERA_POSITION.x + sway,
      CAMERA_POSITION.y - scroll * PARALLAX_DROP,
      CAMERA_POSITION.z
    );
    camera.lookAt(
      CAMERA_TARGET.x,
      CAMERA_TARGET.y,
      CAMERA_TARGET.z - scroll * PARALLAX_LOOK_BACK
    );
    camera.updateMatrixWorld();
  }

  /** Casts the pointer onto the water and eases the ripple in or out. */
  private updatePointer(step: number) {
    const tide = this.tide;
    if (!tide) return;

    this.pointerIdleFor += step;
    let target = 0;
    if (this.pointerInside && this.pointerIdleFor < this.pointerIdleLimit) {
      this.raycaster.setFromCamera(this.pointerNdc, tide.camera);
      const hit = this.raycaster.ray.intersectPlane(
        WATER_PLANE,
        tide.uniforms.uPointer.value
      );
      if (hit) target = 1;
    }

    const rate =
      target > this.pointerStrength ? POINTER_EASE_IN : POINTER_EASE_OUT;
    this.pointerStrength +=
      (target - this.pointerStrength) * (1 - Math.exp(-step * rate));
    if (target === 0 && this.pointerStrength < 0.001) this.pointerStrength = 0;
    tide.uniforms.uPointerStrength.value = this.pointerStrength;
  }

  /** Steps quality down once if the frames keep coming in slow. */
  private watchFrameTime(step: number) {
    if (this.qualityLevel >= 2) return;

    this.framesSeen++;
    if (this.framesSeen <= WARMUP_FRAMES) return;

    this.frameSeconds += step;
    if (this.framesSeen - WARMUP_FRAMES < SAMPLE_FRAMES) return;

    const average = this.frameSeconds / SAMPLE_FRAMES;
    this.framesSeen = WARMUP_FRAMES;
    this.frameSeconds = 0;
    if (average > SLOW_FRAME_SECONDS) {
      this.qualityLevel++;
      this.applyQuality();
      this.applyDensity();
    }
  }

  /** Puts the scene at rest for the still frame under reduced motion. */
  private resetMotion() {
    const tide = this.tide;
    if (!tide) return;

    this.clock = STILL_TIME;
    tide.uniforms.uTime.value = STILL_TIME;
    this.pointerStrength = 0;
    tide.uniforms.uPointerStrength.value = 0;
    this.scrollEased = 0;
    this.placeCamera(0, 0);
  }

  private renderFrame() {
    const tide = this.tide;
    if (tide) tide.renderer.render(tide.scene, tide.camera);
  }

  /** Repaints when no animation loop is running (reduced motion, hidden tab). */
  private renderStill() {
    if (this.animationFrameId === null) this.renderFrame();
  }

  // Arrow functions so add/removeEventListener receive the same reference.
  private readonly onResize = () => {
    this.resize();
    this.renderStill();
  };

  private readonly onScroll = () => {
    const range = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    this.scrollTarget = Math.min(1, Math.max(0, window.scrollY / range));
  };

  // Touch drags are scrolls, so touch only ripples on a tap (pointerdown).
  private readonly onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') this.trackPointer(event);
  };

  private readonly onPointerDown = (event: PointerEvent) => {
    this.trackPointer(event);
  };

  private readonly onPointerLeave = (event: PointerEvent) => {
    // A touch pointer "leaves" as soon as the finger lifts; let the tap play.
    if (event.pointerType !== 'touch') this.pointerInside = false;
  };

  private trackPointer(event: PointerEvent) {
    this.pointerNdc.set(
      (event.clientX / this.size.width) * 2 - 1,
      -(event.clientY / this.size.height) * 2 + 1
    );
    this.pointerInside = true;
    this.pointerIdleFor = 0;
    this.pointerIdleLimit =
      event.pointerType === 'touch' ? POINTER_IDLE_TOUCH : POINTER_IDLE_MOUSE;
  }

  private readonly onContextLost = (event: Event) => {
    // Allow the browser to restore the context, and stop drawing meanwhile.
    event.preventDefault();
    this.stopAnimation();
  };
}
