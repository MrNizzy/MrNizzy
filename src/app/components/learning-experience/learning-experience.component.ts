import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiLinkDirective } from '@shared/ui/link/link.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';
import { ExperienceItem } from '../../pages/home/data';

@Component({
  selector: 'app-learning-experience',
  imports: [
    UiCardDirective,
    UiIconComponent,
    UiLinkDirective,
    UiSectionHeadingComponent,
  ],
  templateUrl: './learning-experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningExperienceComponent {
  public readonly learningExperiences = input<ExperienceItem[]>();
}
