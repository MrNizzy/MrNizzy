import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, UiButtonDirective, UiSectionHeadingComponent],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
