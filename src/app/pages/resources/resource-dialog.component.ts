import { DatePipe } from '@angular/common';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiDialogComponent } from '@shared/ui/dialog/dialog.component';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import type { Resource } from './resource.model';

/** Content of the dialog opened with `UiDialog.open` from the resources list. */
@Component({
  selector: 'app-resource-dialog',
  imports: [DatePipe, UiButtonDirective, UiChipDirective, UiDialogComponent, UiIconComponent],
  templateUrl: './resource-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceDialogComponent {
  readonly resource = inject<Resource>(DIALOG_DATA);
}
