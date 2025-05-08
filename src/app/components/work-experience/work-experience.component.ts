import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WorkExperience } from '../../pages/home/data';
import { ScrollFadeInDirective } from '@app/core/directives/scroll-fade-in.directive';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-work-experience',
  imports: [ScrollFadeInDirective, MatIconModule],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkExperienceComponent {
  public readonly works = input.required<WorkExperience[]>();
}
