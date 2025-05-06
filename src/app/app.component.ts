import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnimatedBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'mrnizzy';
}
