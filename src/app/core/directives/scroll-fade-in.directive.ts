import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appScrollFadeIn]',
  standalone: true,
})
export class ScrollFadeInDirective implements OnInit, OnDestroy {
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Inicialmente hacemos que el elemento sea invisible y trasladado hacia arriba
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'translateY(30px)'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'opacity 0.6s ease, transform 0.6s ease'
    );

    // Configurar el observador de intersección para detectar cuando el elemento entra en el viewport
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si el elemento es visible en el viewport
          if (entry.isIntersecting) {
            // Hacemos que el elemento aparezca con una animación
            this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            this.renderer.setStyle(
              this.el.nativeElement,
              'transform',
              'translateY(0)'
            );

            // Una vez que se ha mostrado, ya no necesitamos observarlo
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    ); // El elemento se anima cuando al menos el 10% es visible

    // Comenzar a observar el elemento
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    // Limpiar el observador cuando el componente se destruye
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
