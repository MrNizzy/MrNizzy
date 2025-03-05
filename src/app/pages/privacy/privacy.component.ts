import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { environment } from '@env/environment';

@Component({
  selector: 'app-privacy',
  imports: [DatePipe, MatIcon],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyComponent {
  appName = environment.appName;
  lastUpdateDate = new Date(2025, 3, 5);
  contactEmail = 'mr.nizzy@proton.me';
  currentYear = new Date().getFullYear();
}
