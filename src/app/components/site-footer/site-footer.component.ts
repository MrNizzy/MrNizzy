import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLink } from '../../pages/home/data';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent implements OnInit {
  @Input() set socialLinks(value: SocialLink[]) {
    this._social.set(value);
  }

  currentYear: number = 0;

  private _social = signal<SocialLink[]>([]);
  social = this._social.asReadonly();

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
  }
}
