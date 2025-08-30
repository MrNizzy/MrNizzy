import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Project } from '../../pages/home/data';

@Component({
  selector: 'app-project-showcase',
  imports: [MatIconModule, MatButtonModule, NgOptimizedImage],
  templateUrl: './project-showcase.component.html',
  styleUrl: './project-showcase.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectShowcaseComponent {
  public readonly projects = input.required<Project[]>();
}
