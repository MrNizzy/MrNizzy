import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { UiButtonDirective, UiDialogComponent } from '@shared/ui';

export type DemoDialogResult = 'confirmed' | 'cancelled';

/** Content of the dialog opened from the UI kit. */
@Component({
  selector: 'app-ui-kit-demo-dialog',
  imports: [UiButtonDirective, UiDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-dialog
      title="Publish changes"
      description="Dismiss it with Escape, a click on the backdrop, the close button or one of the actions."
    >
      <p class="text-fg-muted">
        Focus moved inside the dialog and stays trapped in it. Tab cycles
        through the controls, and focus returns to the button that opened it
        once the dialog closes.
      </p>
      <ng-container footer>
        <button appUiButton variant="secondary" (click)="close('cancelled')">
          Cancel
        </button>
        <button appUiButton variant="primary" (click)="close('confirmed')">
          Confirm
        </button>
      </ng-container>
    </app-ui-dialog>
  `,
})
export class UiKitDemoDialogComponent {
  private readonly dialogRef =
    inject<DialogRef<DemoDialogResult, UiKitDemoDialogComponent>>(DialogRef);

  protected close(result: DemoDialogResult): void {
    this.dialogRef.close(result);
  }
}
