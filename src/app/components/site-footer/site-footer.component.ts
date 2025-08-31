import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-site-footer',
  imports: [],
  templateUrl: './site-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent {
  public readonly currentYear = signal(new Date().getFullYear()).asReadonly();
  public readonly author = signal('MrNizzy');
}
