import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ThemeService } from '@services/theme.service';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { IconName } from '@shared/ui/icon/icon.registry';

/**
 * Icon button that flips between the light and dark theme.
 *
 * Until it is clicked the preference stays `system`. The first click stores an
 * explicit choice, which `ThemeService` persists. The accessible name states
 * the action (what a click will switch to), and the icon shows the same
 * target: a sun while dark, a moon while light.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [UiButtonDirective, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (theme.lightThemeEnabled) {
      <button
        appUiButton
        variant="ghost"
        size="icon"
        [attr.aria-label]="label()"
        (click)="toggle()"
      >
        <app-ui-icon [name]="icon()" [size]="24" />
      </button>
    }
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  private readonly isDark = computed(() => this.theme.resolved() === 'dark');

  protected readonly label = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme'
  );

  protected readonly icon = computed<IconName>(() =>
    this.isDark() ? 'sun' : 'moon'
  );

  protected toggle(): void {
    this.theme.setPreference(this.isDark() ? 'light' : 'dark');
  }
}
