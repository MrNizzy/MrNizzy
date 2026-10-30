import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { COLOR_TRANSITION, FOCUS_RING } from '@shared/ui/ui-classes';

interface NavLink {
  readonly path: string;
  readonly label: string;
}

/** Keep in sync with the `overlay-*-out` animation duration in styles.scss. */
const CLOSE_ANIMATION_MS = 250;

const BRAND = `flex items-center gap-2 rounded-control ${FOCUS_RING}`;

const ICON_BUTTON = `inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted hover:bg-fg/5 hover:text-fg ${FOCUS_RING} ${COLOR_TRANSITION}`;

// The active route is styled from `aria-current`, which RouterLinkActive sets,
// so the same utility order works whatever the hover state.
const DESKTOP_LINK = `rounded-chip px-3 py-2 font-medium text-fg-muted hover:text-fg aria-[current=page]:text-accent aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 ${FOCUS_RING} ${COLOR_TRANSITION}`;

const MOBILE_LINK = `block rounded-control px-4 py-2 font-display text-title font-bold text-fg-muted hover:text-fg aria-[current=page]:text-accent ${FOCUS_RING} ${COLOR_TRANSITION}`;

@Component({
  selector: 'app-navbar',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    CdkTrapFocus,
    RouterLink,
    RouterLinkActive,
    ThemeToggleComponent,
    UiIconComponent,
  ],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly links: readonly NavLink[] = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/resources', label: 'Resources' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly exactMatch = { exact: true };
  protected readonly brandClasses = BRAND;
  protected readonly iconButtonClasses = ICON_BUTTON;
  protected readonly desktopLinkClasses = DESKTOP_LINK;
  protected readonly mobileLinkClasses = MOBILE_LINK;

  readonly isMenuOpen = signal(false);
  readonly isClosing = signal(false);

  /** The menu counts as expanded only until its close animation starts. */
  protected readonly isExpanded = computed(
    () => this.isMenuOpen() && !this.isClosing()
  );

  private readonly burger =
    viewChild<ElementRef<HTMLButtonElement>>('burger');
  private readonly injector = inject(Injector);
  private closeTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.closeTimer));
  }

  open(): void {
    clearTimeout(this.closeTimer);
    this.isClosing.set(false);
    this.isMenuOpen.set(true);
  }

  /** Plays the exit animation, detaches the overlay and refocuses the burger. */
  close(): void {
    if (!this.isMenuOpen() || this.isClosing()) return;
    this.isClosing.set(true);
    this.closeTimer = setTimeout(() => {
      this.isMenuOpen.set(false);
      this.isClosing.set(false);
      // After the overlay (and its focus trap) is gone, so this focus is final.
      afterNextRender(() => this.burger()?.nativeElement.focus(), {
        injector: this.injector,
      });
    }, CLOSE_ANIMATION_MS);
  }

  toggle(): void {
    if (this.isMenuOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }
}
