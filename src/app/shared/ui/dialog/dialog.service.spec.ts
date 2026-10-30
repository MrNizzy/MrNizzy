import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UiDialog } from './dialog.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p id="data">{{ data.name }}</p>`,
})
class DataDialogComponent {
  protected readonly data = inject<{ name: string }>(DIALOG_DATA);
  readonly ref = inject(DialogRef);
}

describe('UiDialog', () => {
  let service: UiDialog;

  const pane = () => document.querySelector<HTMLElement>('.cdk-overlay-pane')!;

  beforeEach(() => {
    service = TestBed.inject(UiDialog);
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  it('opens the component and returns a typed reference', () => {
    const ref = service.open<string, { name: string }, DataDialogComponent>(
      DataDialogComponent,
      { data: { name: 'Ada' } }
    );
    TestBed.tick();

    expect(ref.componentInstance).toBeInstanceOf(DataDialogComponent);
    expect(document.querySelector('#data')?.textContent).toBe('Ada');
    expect(TestBed.inject(Dialog).openDialogs).toContain(ref);
  });

  it('applies the design system defaults', () => {
    const ref = service.open(DataDialogComponent, { data: { name: 'Ada' } });

    expect(ref.config.hasBackdrop).toBeTrue();
    expect(ref.config.autoFocus).toBe('first-tabbable');
    expect(ref.config.restoreFocus).toBeTrue();
    expect(ref.config.closeOnNavigation).toBeTrue();
    expect(ref.config.ariaModal).toBeTrue();
    expect(ref.config.disableClose).toBeFalsy();
  });

  it('is responsive: capped width with a gutter and a bounded height', () => {
    service.open(DataDialogComponent, { data: { name: 'Ada' } });
    TestBed.tick();

    const style = pane().style;
    expect(style.width).toContain('32rem');
    expect(style.width).toContain('100vw');
    expect(style.maxHeight).toContain('100dvh');
  });

  it('lets the caller override the defaults', () => {
    const ref = service.open(DataDialogComponent, {
      data: { name: 'Ada' },
      width: '20rem',
      disableClose: true,
      restoreFocus: false,
    });
    TestBed.tick();

    expect(pane().style.width).toBe('20rem');
    expect(ref.config.disableClose).toBeTrue();
    expect(ref.config.restoreFocus).toBeFalse();
  });

  it('keeps its own classes when the caller adds some', () => {
    service.open(DataDialogComponent, {
      data: { name: 'Ada' },
      panelClass: 'extra-panel',
      backdropClass: 'extra-backdrop',
    });
    TestBed.tick();

    expect(pane().classList).toContain('app-ui-dialog-panel');
    expect(pane().classList).toContain('extra-panel');
    const backdrop = document.querySelector('.cdk-overlay-backdrop')!;
    expect(backdrop.classList).toContain('bg-canvas/70');
    expect(backdrop.classList).toContain('extra-backdrop');
  });

  it('does not let the caller replace the labelling set up by the service', () => {
    const ref = service.open(DataDialogComponent, { data: { name: 'Ada' } });

    expect(ref.config.ariaLabelledBy).toMatch(/^app-ui-dialog-title-\d+$/);
  });

  it('closes on browser navigation', () => {
    const ref = service.open(DataDialogComponent, { data: { name: 'Ada' } });

    expect(ref.config.closeOnNavigation).toBeTrue();
    expect(ref.overlayRef.getConfig().disposeOnNavigation).toBeTrue();
  });

  it('resolves `closed` with the result', async () => {
    const ref = service.open<string, { name: string }, DataDialogComponent>(
      DataDialogComponent,
      { data: { name: 'Ada' } }
    );
    const closed = new Promise<string | undefined>((resolve) =>
      ref.closed.subscribe(resolve)
    );

    ref.close('done');

    expect(await closed).toBe('done');
  });
});
