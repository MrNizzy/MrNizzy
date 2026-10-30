import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiDialogComponent } from './dialog.component';
import { UiDialog } from './dialog.service';

@Component({
  imports: [UiDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-dialog title="Delete project" [description]="description">
      <p id="body">This cannot be undone.</p>
      <ng-container footer>
        <button id="cancel" type="button" (click)="ref.close('cancelled')">
          Cancel
        </button>
        <button id="confirm" type="button" (click)="ref.close('confirmed')">
          Confirm
        </button>
      </ng-container>
    </app-ui-dialog>
  `,
})
class ContentComponent {
  protected readonly ref = inject(DialogRef);
  protected readonly description = 'All data is removed.';
}

@Component({
  imports: [UiDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-ui-dialog title="No footer"><p>Just text.</p></app-ui-dialog>`,
})
class BareContentComponent {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div data-theme="light">
      <button id="scoped-opener" type="button" (click)="openScoped()">Scoped</button>
    </div>
    <button id="opener" type="button" (click)="open()">Open</button>
  `,
})
class OpenerComponent {
  private readonly dialog = inject(UiDialog);
  ref?: DialogRef<string, ContentComponent>;

  open(): void {
    this.ref = this.dialog.open<string, unknown, ContentComponent>(
      ContentComponent
    );
  }

  openScoped(): void {
    this.dialog.open(ContentComponent);
  }
}

const KEY_CODES: Record<string, number> = { Escape: 27, Tab: 9 };

function press(key: string, target: EventTarget): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      keyCode: KEY_CODES[key],
      bubbles: true,
      cancelable: true,
    })
  );
}

describe('UiDialogComponent', () => {
  let fixture: ComponentFixture<OpenerComponent>;
  let opener: HTMLButtonElement;

  const query = <T extends Element = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector);
  const container = () => query('.cdk-dialog-container');
  const closeButton = () => query<HTMLButtonElement>('[aria-label="Close dialog"]');

  async function settle(): Promise<void> {
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    fixture.detectChanges();
    TestBed.tick();
  }

  async function openDialog(): Promise<void> {
    opener.focus();
    opener.click();
    await settle();
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(OpenerComponent);
    fixture.detectChanges();
    opener = fixture.nativeElement.querySelector('#opener');
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  describe('opening', () => {
    it('renders the content in a modal dialog above the page', async () => {
      await openDialog();

      expect(container()).not.toBeNull();
      expect(container()?.getAttribute('role')).toBe('dialog');
      expect(container()?.getAttribute('aria-modal')).toBe('true');
      expect(query('app-ui-dialog h2')?.textContent).toContain('Delete project');
      expect(query('#body')?.textContent).toContain('This cannot be undone.');
    });

    it('centres the dialog in the viewport', async () => {
      await openDialog();

      const rect = query('.cdk-overlay-pane')!.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      // clientWidth excludes the scrollbar, which the fixed overlay layer also does.
      const { clientWidth, clientHeight } = document.documentElement;

      expect(rect.width).toBeGreaterThan(0);
      expect(Math.abs(centreX - clientWidth / 2)).toBeLessThan(2);
      expect(Math.abs(centreY - clientHeight / 2)).toBeLessThan(2);
    });

    it('uses the semantic surface tokens', async () => {
      await openDialog();

      const classes = query('app-ui-dialog')!.classList;
      for (const token of ['bg-surface', 'border-line', 'rounded-card', 'text-fg']) {
        expect(classes).withContext(token).toContain(token);
      }
      expect(getComputedStyle(query('app-ui-dialog')!).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)'
      );
    });

    it('dims the page with a backdrop that uses the canvas token', async () => {
      await openDialog();

      const backdrop = query('.cdk-overlay-backdrop')!;
      expect(backdrop.classList).toContain('bg-canvas/70');
      expect(backdrop.classList).toContain('backdrop-blur-sm');
      expect(getComputedStyle(backdrop).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)'
      );
    });

    it('moves focus to the first tabbable control inside the dialog', async () => {
      await openDialog();

      expect(document.activeElement).toBe(closeButton());
    });

    it('hides the footer when no actions are projected', async () => {
      TestBed.inject(UiDialog).open(BareContentComponent);
      await settle();

      expect(getComputedStyle(query('app-ui-dialog footer')!).display).toBe('none');
    });
  });

  describe('accessible name and description', () => {
    it('labels the dialog with its title', async () => {
      await openDialog();

      const labelledBy = container()!.getAttribute('aria-labelledby');
      const title = labelledBy ? document.getElementById(labelledBy) : null;

      expect(labelledBy).toBeTruthy();
      expect(title?.tagName).toBe('H2');
      expect(title?.textContent).toContain('Delete project');
    });

    it('does not leave the title as a native tooltip on the host', async () => {
      await openDialog();

      const dialogHost = document.querySelector('app-ui-dialog');
      expect(dialogHost).toBeTruthy();
      expect(dialogHost!.hasAttribute('title')).toBeFalse();
    });

    it('gives every dialog its own title id', async () => {
      await openDialog();
      TestBed.inject(UiDialog).open(BareContentComponent);
      await settle();

      const ids = Array.from(
        document.querySelectorAll('.cdk-dialog-container')
      ).map((el) => el.getAttribute('aria-labelledby'));

      expect(ids.length).toBe(2);
      expect(new Set(ids).size).toBe(2);
    });

    it('describes the dialog with the description paragraph', async () => {
      await openDialog();

      const describedBy = container()!.getAttribute('aria-describedby');
      const description = describedBy ? document.getElementById(describedBy) : null;

      expect(description?.textContent).toContain('All data is removed.');
    });

    it('does not set aria-describedby without a description', async () => {
      TestBed.inject(UiDialog).open(BareContentComponent);
      await settle();

      expect(container()!.hasAttribute('aria-describedby')).toBeFalse();
    });

    it('names the close button', async () => {
      await openDialog();

      expect(closeButton()?.tagName).toBe('BUTTON');
      expect(closeButton()?.getAttribute('type')).toBe('button');
    });
  });

  describe('closing', () => {
    it('closes from the close button', async () => {
      await openDialog();

      closeButton()!.click();
      await settle();

      expect(container()).toBeNull();
    });

    it('closes with Escape', async () => {
      await openDialog();

      press('Escape', document.activeElement!);
      await settle();

      expect(container()).toBeNull();
    });

    it('closes when the backdrop is clicked', async () => {
      await openDialog();

      query('.cdk-overlay-backdrop')!.click();
      await settle();

      expect(container()).toBeNull();
    });

    it('stays open when a click lands inside the dialog', async () => {
      await openDialog();

      query('#body')!.click();
      await settle();

      expect(container()).not.toBeNull();
    });

    it('closes with the value passed by the content', async () => {
      await openDialog();
      let result: string | undefined;
      fixture.componentInstance.ref!.closed.subscribe((value) => (result = value));

      query<HTMLButtonElement>('#confirm')!.click();
      await settle();

      expect(result).toBe('confirmed');
      expect(container()).toBeNull();
    });

    it('returns focus to the element that opened it', async () => {
      await openDialog();
      expect(document.activeElement).not.toBe(opener);

      closeButton()!.click();
      await settle();

      expect(document.activeElement).toBe(opener);
    });

    it('returns focus after closing with Escape too', async () => {
      await openDialog();

      press('Escape', document.activeElement!);
      await settle();

      expect(document.activeElement).toBe(opener);
    });
  });

  describe('focus and page scroll', () => {
    it('wraps focus around the dialog at both ends', async () => {
      await openDialog();
      const [start, end] = Array.from(
        document.querySelectorAll<HTMLElement>('.cdk-focus-trap-anchor')
      );

      start.focus();
      expect(document.activeElement).toBe(query('#confirm'));

      end.focus();
      expect(document.activeElement).toBe(closeButton());
    });

    it('blocks page scrolling while open and releases it on close', async () => {
      const spacer = document.createElement('div');
      spacer.style.height = '4000px';
      document.body.appendChild(spacer);
      const root = document.documentElement;

      try {
        await openDialog();
        expect(root.classList).toContain('cdk-global-scrollblock');
        expect(getComputedStyle(root).position).toBe('fixed');

        closeButton()!.click();
        await settle();
        expect(root.classList).not.toContain('cdk-global-scrollblock');
      } finally {
        spacer.remove();
      }
    });

    it('hides the page behind the dialog from assistive technology', async () => {
      await openDialog();

      expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');

      closeButton()!.click();
      await settle();

      expect(fixture.nativeElement.hasAttribute('aria-hidden')).toBeFalse();
    });
  });

  describe('theme scope', () => {
    it('stays on the document theme when opened from the page', async () => {
      await openDialog();

      expect(query('app-ui-dialog')!.hasAttribute('data-theme')).toBeFalse();
    });

    it('inherits a scoped theme from the opener', async () => {
      const scoped = fixture.nativeElement.querySelector(
        '#scoped-opener'
      ) as HTMLButtonElement;
      scoped.focus();
      scoped.click();
      await settle();

      expect(query('app-ui-dialog')!.getAttribute('data-theme')).toBe('light');
    });
  });
});
