import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { ExperienceItem } from '../../pages/home/data';

@Component({
  selector: 'app-learning-experience',
  templateUrl: './learning-experience.component.html',
  styleUrl: './learning-experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningExperienceComponent {
  @Input() set learningExperiences(value: ExperienceItem[]) {
    this._experience.set(value);
  }

  private _experience = signal<ExperienceItem[]>([]);
  experience = this._experience.asReadonly();
}
