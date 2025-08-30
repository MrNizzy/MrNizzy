import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
} from '@angular/core';

import { Tool } from '../../pages/home/data';

@Component({
  selector: 'app-tech-stack',
  standalone: true,
  imports: [],
  templateUrl: './tech-stack.component.html',
  styleUrl: './tech-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechStackComponent {
  @Input() set tools(value: Tool[][]) {
    this._toolGroups.set(value);
  }

  private _toolGroups = signal<Tool[][]>([]);
  toolGroups = this._toolGroups.asReadonly();
}
