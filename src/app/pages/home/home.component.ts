import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarComponent } from '@components/sidebar/sidebar.component';

@Component({
  selector: 'app-home',
  imports: [SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
