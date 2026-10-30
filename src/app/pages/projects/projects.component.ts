import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectShowcaseComponent } from '@components/project-showcase/project-showcase.component';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

@Component({
  selector: 'app-projects',
  imports: [ProjectShowcaseComponent, UiSectionHeadingComponent],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {}
