import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';
import { Tool } from '../../pages/home/data';

@Component({
  selector: 'app-tech-stack',
  imports: [UiCardDirective, UiSectionHeadingComponent],
  templateUrl: './tech-stack.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechStackComponent {
  readonly tools = input<Tool[][]>([]);
}
