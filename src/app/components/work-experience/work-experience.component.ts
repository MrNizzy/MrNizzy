import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WorkExperience } from '../../pages/home/data';

@Component({
  selector: 'app-work-experience',
  imports: [CommonModule, MatIconModule],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkExperienceComponent {
  @Input() set experiences(value: WorkExperience[]) {
    this._work.set(value);
  }

  private _work = signal<WorkExperience[]>([]);
  work = this._work.asReadonly();
}
