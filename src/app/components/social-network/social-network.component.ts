import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SocialLink, socialLinks } from '@app/pages/home/data';

@Component({
  selector: 'app-social-network',
  imports: [],
  templateUrl: './social-network.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialNetworkComponent {
  readonly socialLinks = signal<SocialLink[]>(socialLinks);
}
