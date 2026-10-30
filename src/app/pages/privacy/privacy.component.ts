import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '@env/environment';
import { CONTACT_EMAIL } from '@models/contact.model';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiLinkDirective } from '@shared/ui/link/link.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

/** Date the policy was last revised, as an ISO calendar date. */
const LAST_UPDATED_ISO = '2025-04-05';

// The policy is written in Spanish, so the date follows Spanish conventions
// whatever the app locale is. UTC keeps the calendar day stable in any timezone.
const LAST_UPDATED_FORMAT = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-privacy',
  imports: [
    RouterLink,
    UiCardDirective,
    UiIconComponent,
    UiLinkDirective,
    UiSectionHeadingComponent,
  ],
  templateUrl: './privacy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent {
  readonly appName = environment.appName;
  readonly contactEmail = CONTACT_EMAIL;
  readonly mailtoHref = `mailto:${CONTACT_EMAIL}`;
  readonly lastUpdatedIso = LAST_UPDATED_ISO;
  readonly lastUpdated = LAST_UPDATED_FORMAT.format(new Date(LAST_UPDATED_ISO));
}
