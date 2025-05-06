import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Project } from '../../pages/home/data';

@Component({
  selector: 'app-project-showcase',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './project-showcase.component.html',
  styleUrl: './project-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectShowcaseComponent {
  @Input() set projectsData(value: Project[]) {
    this._projects.set(value);
  }

  private _projects = signal<Project[]>([]);
  projects = this._projects.asReadonly();
}
