import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, OverlayModule],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly isMenuOpen = signal(false);
  readonly isClosing = signal(false);

  open() {
    this.isClosing.set(false);
    this.isMenuOpen.set(true);
  }

  close() {
    // play exit animation then detach overlay
    if (!this.isMenuOpen()) return;
    this.isClosing.set(true);
    setTimeout(() => {
      this.isMenuOpen.set(false);
      this.isClosing.set(false);
    }, 250); // keep in sync with CSS animation duration
  }

  toggle() {
    this.isMenuOpen.update((v) => !v);
  }
}
