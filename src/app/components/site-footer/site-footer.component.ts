import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

import { SocialLink } from '../../pages/home/data';

@Component({
  selector: 'app-site-footer',
  imports: [],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  public readonly socialLinks = input<SocialLink[]>([]);

  public readonly currentYear = signal(new Date().getFullYear()).asReadonly();
}
