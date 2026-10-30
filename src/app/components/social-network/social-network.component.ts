import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
  CONTACT_EMAIL_SUBJECT,
  ContactChannel,
} from '@models/contact.model';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { IconName } from '@shared/ui/icon/icon.registry';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

/**
 * Channels whose brand mark is a single-colour glyph. They use the icon
 * registry (drawn in `currentColor`) instead of the white SVG asset, which
 * would disappear on a light surface.
 */
const REGISTRY_ICONS: Readonly<Record<string, IconName>> = {
  GitHub: 'github',
};

@Component({
  selector: 'app-social-network',
  imports: [UiButtonDirective, UiIconComponent, UiSectionHeadingComponent],
  templateUrl: './social-network.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialNetworkComponent {
  readonly channels: readonly ContactChannel[] = CONTACT_CHANNELS;
  readonly mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    CONTACT_EMAIL_SUBJECT
  )}`;

  protected registryIcon(channel: ContactChannel): IconName | null {
    return REGISTRY_ICONS[channel.name] ?? null;
  }
}
