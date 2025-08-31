import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  viewChild,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-animated-background',
  templateUrl: './animated-background.component.html',
  styleUrl: './animated-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedBackgroundComponent implements OnInit, OnDestroy {
  private readonly containerRef = viewChild.required<ElementRef>('container');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private particles!: THREE.Points;
  private animationFrameId: number | null = null;

  ngOnInit() {
    this.initThree();
    this.animate();

    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.containerRef().nativeElement.removeChild(this.renderer.domElement);
    this.disposeScene();
  }

  private initThree() {
    // Configurar escena
    this.scene = new THREE.Scene();

    // Configurar cámara
    const aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = 30;

    // Configurar renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.containerRef().nativeElement.appendChild(this.renderer.domElement);

    // Crear partículas
    this.createParticles();
  }

  private createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0xf6339a);
    const color2 = new THREE.Color(0x4b0082); // Color índigo

    const colors = new Float32Array(particleCount * 3);

    // Distribuir las partículas en el espacio
    for (let i = 0; i < particleCount; i++) {
      // Posiciones
      positions[i * 3] = (Math.random() - 0.5) * 100; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z

      // Tamaños
      sizes[i] = Math.random() * 2 + 0.5;

      // Colores
      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r; // R
      colors[i * 3 + 1] = mixedColor.g; // G
      colors[i * 3 + 2] = mixedColor.b; // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material para las partículas
    const material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1,
    });

    // Crear el sistema de partículas
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Rotación lenta de las partículas
    if (this.particles) {
      this.particles.rotation.x += 0.0005;
      this.particles.rotation.y += 0.0007;
    }

    // Renderizar la escena
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    // Actualizar cámara y renderer cuando la ventana cambie de tamaño
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private disposeScene() {
    // Limpiar memoria
    if (this.particles) {
      this.scene.remove(this.particles);
      (this.particles.geometry as THREE.BufferGeometry).dispose();
      (this.particles.material as THREE.Material).dispose();
    }
  }
}
