import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';
import { UiIconComponent } from '../icon/icon.component';
import { COLOR_TRANSITION, FOCUS_RING } from '../ui-classes';
import { UI_DIALOG_CONTEXT } from './dialog.service';

let nextId = 0;

const CLOSE_BUTTON = `inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted hover:bg-fg/5 hover:text-fg ${FOCUS_RING} ${COLOR_TRANSITION}`;

/**
 * Standard surface for dialog content: a card with a title, an optional
 * description, a close button, the projected body and a `[footer]` slot for
 * actions.
 *
 * Use it as the root of a component opened with `UiDialog.open`. The title
 * labels the dialog (`aria-labelledby`) and the description describes it
 * (`aria-describedby`); Escape and backdrop clicks are handled by the CDK.
 *
 * ```html
 * <app-ui-dialog title="Delete project" description="This cannot be undone.">
 *   <p>Body</p>
 *   <ng-container footer>
 *     <button appUiButton variant="secondary">Cancel</button>
 *     <button appUiButton>Delete</button>
 *   </ng-container>
 * </app-ui-dialog>
 * ```
 */
@Component({
  selector: 'app-ui-dialog',
  imports: [UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'overlay-panel-in flex max-h-[inherit] flex-col rounded-card border border-line bg-surface text-fg shadow-[var(--ds-shadow-card)]',
    '[attr.data-theme]': 'context?.theme ?? null',
    // The `title` input would otherwise stay on the host as a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    <header class="flex items-start justify-between gap-4 p-6 pb-4">
      <div class="grid gap-1.5">
        <h2 [id]="titleId" class="text-heading text-fg">{{ title() }}</h2>
        @if (description(); as text) {
          <p [id]="descriptionId" class="text-fg-muted">{{ text }}</p>
        }
      </div>
      <button
        type="button"
        [class]="closeButtonClasses"
        aria-label="Close dialog"
        (click)="close()"
      >
        <app-ui-icon name="close" [size]="20" />
      </button>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-2">
      <ng-content />
    </div>

    <footer class="flex flex-wrap items-center justify-end gap-3 p-6 pt-4 empty:hidden">
      <ng-content select="[footer]" />
    </footer>
  `,
})
export class UiDialogComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();

  protected readonly closeButtonClasses = CLOSE_BUTTON;

  protected readonly context = inject(UI_DIALOG_CONTEXT, { optional: true });
  private readonly dialogRef = inject(DialogRef, { optional: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /** The id `UiDialog` registered as `aria-labelledby`, or a local one outside it. */
  protected readonly titleId =
    this.context?.titleId ?? `app-ui-dialog-title-local-${nextId++}`;

  protected readonly descriptionId = `app-ui-dialog-description-${nextId++}`;

  constructor() {
    // The CDK container carries the dialog role, so the description is wired
    // there. It cannot be set through config because it only exists when the
    // consumer passes one.
    effect((onCleanup) => {
      const container = this.host.nativeElement.closest('[role="dialog"]');
      if (!container || !this.description()) return;

      this.renderer.setAttribute(container, 'aria-describedby', this.descriptionId);
      onCleanup(() =>
        this.renderer.removeAttribute(container, 'aria-describedby')
      );
    });
  }

  protected close(): void {
    this.dialogRef?.close();
  }
}
