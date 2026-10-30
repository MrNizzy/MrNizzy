import { DialogConfig, DialogRef, Dialog } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { themeScopeOf } from '../theme-scope';

/**
 * Per-dialog values the service hands to `app-ui-dialog`, which renders inside
 * the dialog and therefore cannot know them on its own.
 */
export interface UiDialogContext {
  /** Id for the element that titles the dialog (`aria-labelledby`). */
  readonly titleId: string;
  /** Theme scope inherited from the opener, or `null` for the document theme. */
  readonly theme: string | null;
}

export const UI_DIALOG_CONTEXT = new InjectionToken<UiDialogContext>(
  'UI_DIALOG_CONTEXT'
);

/**
 * Options accepted by `UiDialog.open`.
 *
 * Accessibility wiring is owned by the service (`ariaLabelledBy`, `ariaLabel`),
 * as is the container; use `injector` to give the content custom providers.
 */
export type UiDialogConfig<D = unknown> = Omit<
  DialogConfig<D>,
  'ariaLabelledBy' | 'ariaLabel' | 'providers' | 'container' | 'templateContext'
>;

/** Dims and slightly blurs the page behind the dialog. */
const BACKDROP_CLASSES = ['bg-canvas/70', 'backdrop-blur-sm'];

/**
 * The CDK pane only positions and sizes the dialog; the visible surface is
 * `app-ui-dialog`. This class is a stable hook for layout tweaks and tests.
 */
const PANEL_CLASSES = ['app-ui-dialog-panel'];

/** Fills small screens with a gutter, caps at a readable width on large ones. */
const DEFAULT_WIDTH = 'min(32rem, calc(100vw - 2rem))';
const DEFAULT_MAX_HEIGHT = 'calc(100dvh - 2rem)';

let nextTitleId = 0;

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * Opens modal dialogs on top of `@angular/cdk/dialog` with the design system
 * defaults: dimmed backdrop, focus moved in and restored on close, Escape and
 * backdrop clicks to dismiss, page scroll blocked, closed on navigation.
 *
 * The dialog content is a regular component. Wrap it in `app-ui-dialog` for the
 * standard surface, header and close button.
 */
@Injectable({ providedIn: 'root' })
export class UiDialog {
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);

  /**
   * @typeParam R - value the dialog closes with (`DialogRef.close(result)`)
   * @typeParam D - data injected into the content through `DIALOG_DATA`
   * @typeParam C - content component type
   */
  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config: UiDialogConfig<D> = {}
  ): DialogRef<R, C> {
    const context: UiDialogContext = {
      titleId: `app-ui-dialog-title-${nextTitleId++}`,
      // Like restoreFocus, this assumes the opener is the focused element.
      theme: themeScopeOf(this.document.activeElement),
    };

    return this.dialog.open<R, D, C>(component, {
      hasBackdrop: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      closeOnNavigation: true,
      ariaModal: true,
      width: DEFAULT_WIDTH,
      maxHeight: DEFAULT_MAX_HEIGHT,
      ...config,
      backdropClass: [...BACKDROP_CLASSES, ...toArray(config.backdropClass)],
      panelClass: [...PANEL_CLASSES, ...toArray(config.panelClass)],
      ariaLabelledBy: context.titleId,
      providers: [{ provide: UI_DIALOG_CONTEXT, useValue: context }],
    });
  }
}
