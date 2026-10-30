import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonDirective } from '@shared/ui/button/button.directive';

@Component({
  selector: 'app-hero-banner',
  imports: [RouterLink, UiButtonDirective],
  templateUrl: './hero-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {}
