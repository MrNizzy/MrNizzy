import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProfileInfo } from '../../pages/home/data';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  @Input() set profileInfo(value: ProfileInfo) {
    this._profile.set(value);
  }

  private _profile = signal<ProfileInfo>({
    title: '',
    subtitle: '',
    description: '',
  });

  profile = this._profile.asReadonly();
}
