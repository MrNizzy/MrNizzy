import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { sidebar, SimpleMenuItem } from '@app/core/models/sidebar.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly menuItems = signal<SimpleMenuItem[]>(sidebar);
}
