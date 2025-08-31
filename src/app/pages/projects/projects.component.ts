import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectShowcaseComponent } from "@app/components/project-showcase/project-showcase.component";

@Component({
  selector: 'app-projects',
  imports: [ProjectShowcaseComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent {

}
