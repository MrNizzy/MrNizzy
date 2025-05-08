import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProfileInfo } from '../../pages/home/data';

@Component({
  selector: 'app-hero-banner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  public readonly profileInfo = input.required<ProfileInfo>();
}
