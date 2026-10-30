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

interface ParticleStyle {
  /** The two colours each particle blends between (sRGB hex). */
  readonly colors: readonly [number, number];
  /** Material opacity, 0 to 1. */
  readonly opacity: number;
  /** How many of the `PARTICLE_COUNT` particles are drawn. */
  readonly count: number;
}

const PARTICLE_COUNT = 100;

/**
 * How the particles look per theme. Dark is the original look. In light, the
 * same saturated squares would sit on top of body text, so they become faint
 * pastels and thinner out. At these values the darkest blend still leaves
 * 6:1+ for muted body text and about 4.4:1 for the subtlest meta text, both
 * measured over the light canvas.
 */
const PARTICLE_STYLES: Record<ResolvedTheme, ParticleStyle> = {
  dark: { colors: [0xf6339a, 0x4b0082], opacity: 1, count: PARTICLE_COUNT },
  light: { colors: [0xf9a8d4, 0xa5b4fc], opacity: 0.2, count: 60 },
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'app-animated-background',
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedBackgroundComponent implements OnInit, OnDestroy {
  private readonly containerRef = viewChild.required<ElementRef>('container');
  private readonly theme = inject(ThemeService);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  /** Where each particle sits between the two theme colours (0 to 1). */
  private colorMix!: Float32Array;
  private animationFrameId: number | null = null;
  private readonly motionQuery =
    window.matchMedia?.(REDUCED_MOTION_QUERY) ?? null;

  constructor() {
    // Restyle the existing particles when the theme changes; the scene is
    // never rebuilt. Runs before init too, hence the guard in applyTheme.
    effect(() => {
      const theme = this.theme.resolved();
      untracked(() => this.applyTheme(theme));
    });
  }

  ngOnInit() {
    this.initThree();
    this.syncAnimation();

    window.addEventListener('resize', this.onWindowResize);
    this.motionQuery?.addEventListener('change', this.syncAnimation);
  }

  ngOnDestroy() {
    this.stopAnimation();
    window.removeEventListener('resize', this.onWindowResize);
    this.motionQuery?.removeEventListener('change', this.syncAnimation);
    // The component can be destroyed before ngOnInit (e.g. in tests).
    if (this.renderer) {
      this.containerRef().nativeElement.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
    this.disposeScene();
  }

  private initThree() {
    this.scene = new THREE.Scene();

    const aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 30;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef().nativeElement.appendChild(this.renderer.domElement);

    this.createParticles();
  }

  private createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    this.colorMix = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z

      sizes[i] = Math.random() * 2 + 0.5;
      this.colorMix[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    // Filled in by applyTheme.
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3)
    );

    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    this.applyTheme(this.theme.resolved());
  }

  /** Recolours, fades and thins the existing particles for a theme. */
  private applyTheme(theme: ResolvedTheme) {
    if (!this.particles) return;

    const style = PARTICLE_STYLES[theme];
    const geometry = this.particles.geometry as THREE.BufferGeometry;
    const material = this.particles.material as THREE.PointsMaterial;
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute;

    const from = new THREE.Color(style.colors[0]);
    const to = new THREE.Color(style.colors[1]);
    const mixed = new THREE.Color();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      mixed.copy(from).lerp(to, this.colorMix[i]);
      colors.setXYZ(i, mixed.r, mixed.g, mixed.b);
    }
    colors.needsUpdate = true;

    material.opacity = style.opacity;
    geometry.setDrawRange(0, style.count);

    this.renderStill();
  }

  /** Starts or stops the loop to match the reduced-motion preference. */
  private readonly syncAnimation = () => {
    if (this.motionQuery?.matches) {
      this.stopAnimation();
      this.renderFrame();
    } else if (this.animationFrameId === null) {
      this.animate();
    }
  };

  private stopAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Slow rotation of the particles.
    if (this.particles) {
      this.particles.rotation.x += 0.0005;
      this.particles.rotation.y += 0.0007;
    }

    this.renderFrame();
  }

  private renderFrame() {
    this.renderer?.render(this.scene, this.camera);
  }

  /** Repaints when no animation loop is running (reduced motion). */
  private renderStill() {
    if (this.animationFrameId === null) this.renderFrame();
  }

  // Arrow function so add/removeEventListener receive the same reference.
  private readonly onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderStill();
  };

  private disposeScene() {
    if (this.scene && this.particles) {
      this.scene.remove(this.particles);
      (this.particles.geometry as THREE.BufferGeometry).dispose();
      (this.particles.material as THREE.Material).dispose();
    }
  }
}
