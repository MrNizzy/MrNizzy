import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  CONTACT_CHANNELS,
  CONTACT_EMAIL,
  CONTACT_EMAIL_SUBJECT,
  ContactChannel,
} from '@models/contact.model';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

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
}
