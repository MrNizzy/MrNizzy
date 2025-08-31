import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExperienceItem } from '../../pages/home/data';

@Component({
  selector: 'app-learning-experience',
  templateUrl: './learning-experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningExperienceComponent {
  public readonly learningExperiences = input<ExperienceItem[]>();
}
