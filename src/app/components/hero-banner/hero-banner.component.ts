import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROFILE_PHOTO } from '@shared/profile-photo';
import { UiButtonDirective } from '@shared/ui/button/button.directive';

@Component({
  selector: 'app-hero-banner',
  imports: [RouterLink, UiButtonDirective],
  templateUrl: './hero-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  protected readonly photo = PROFILE_PHOTO;
}
