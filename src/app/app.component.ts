import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background.component';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { SiteFooterComponent } from "./components/site-footer/site-footer.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AnimatedBackgroundComponent, NavbarComponent, SiteFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'mrnizzy';
}
