import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiLinkDirective } from '@shared/ui/link/link.directive';

interface FooterLink {
  readonly path: string;
  readonly label: string;
}

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, UiLinkDirective],
  templateUrl: './site-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  public readonly currentYear = signal(new Date().getFullYear()).asReadonly();
  public readonly author = signal('MrNizzy');

  /** The privacy page is the policy of the owner's Android app, not of this site. */
  protected readonly links: readonly FooterLink[] = [
    { path: '/about', label: 'About' },
    { path: '/privacy', label: 'App privacy policy' },
  ];
}
