import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProfileInfo } from '../../pages/home/data';

@Component({
  selector: 'app-hero-banner',
  imports: [],
  templateUrl: './hero-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  public readonly profileInfo = input.required<ProfileInfo>();
}
