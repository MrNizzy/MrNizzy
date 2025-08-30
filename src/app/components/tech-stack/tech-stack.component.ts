import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { Tool } from '../../pages/home/data';

@Component({
  selector: 'app-tech-stack',
  imports: [],
  templateUrl: './tech-stack.component.html',
  styleUrl: './tech-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechStackComponent {
  readonly tools = input<Tool[][]>([]);
}
