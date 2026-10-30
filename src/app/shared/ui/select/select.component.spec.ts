import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiDialogComponent } from '../dialog/dialog.component';
import { UiDialog } from '../dialog/dialog.service';
import { UiSelectComponent } from './select.component';

@Component({
  imports: [UiSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button id="before" type="button">Before</button>
    <app-ui-select
      label="Topic"
      placeholder="Pick a topic"
      [options]="options()"
      [value]="value()"
      (valueChange)="pick($event)"
    />
    <button id="after" type="button">After</button>
    <div data-theme="light">
      <app-ui-select id="scoped" label="Scoped" [options]="options()" />
    </div>
  `,
})
class HostComponent {
  readonly options = signal(['angular', 'nestjs', 'tailwind', 'testing']);
  readonly value = signal('');
  readonly changes: string[] = [];

  pick(value: string): void {
    this.changes.push(value);
    this.value.set(value);
  }
}

@Component({
  imports: [UiDialogComponent, UiSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-ui-dialog title="Filters">
      <app-ui-select
        id="in-dialog"
        label="Topic"
        [options]="['angular', 'nestjs']"
        value="angular"
      />
    </app-ui-dialog>
  `,
})
class SelectDialogComponent {
  readonly ref = inject(DialogRef);
}

const KEY_CODES: Record<string, number> = {
  Escape: 27,
  Tab: 9,
  Enter: 13,
  ' ': 32,
  ArrowUp: 38,
  ArrowDown: 40,
  Home: 36,
  End: 35,
};

function press(key: string, target: EventTarget = document.activeElement!): void {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      keyCode: KEY_CODES[key] ?? key.toUpperCase().charCodeAt(0),
      bubbles: true,
      cancelable: true,
    })
  );
}

describe('UiSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const root = () => fixture.nativeElement as HTMLElement;
  const trigger = (selector = 'app-ui-select:not(#scoped)') =>
    root().querySelector(`${selector} button`) as HTMLButtonElement;
  const listbox = () => document.querySelector<HTMLElement>('[role="listbox"]');
  const options = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
  const option = (label: string) =>
    options().find((el) => el.textContent?.trim() === label)!;
  const active = () => document.activeElement as HTMLElement;

  async function settle(): Promise<void> {
    fixture.detectChanges();
    TestBed.tick();
    await fixture.whenStable();
    fixture.detectChanges();
    TestBed.tick();
  }

  async function openWithKeyboard(): Promise<void> {
    trigger().focus();
    press('ArrowDown');
    await settle();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('trigger', () => {
    it('is a button that announces a listbox popup', () => {
      expect(trigger().tagName).toBe('BUTTON');
      expect(trigger().getAttribute('type')).toBe('button');
      expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().hasAttribute('aria-controls')).toBeFalse();
    });

    it('is named by the visible label and the current value', () => {
      const labelId = trigger().getAttribute('aria-labelledby')!.split(' ')[0];

      expect(document.getElementById(labelId)?.textContent?.trim()).toBe('Topic');
      expect(trigger().getAttribute('aria-labelledby')).toContain(trigger().id);
    });

    it('shows the placeholder until something is selected', async () => {
      expect(trigger().textContent).toContain('Pick a topic');

      host.value.set('nestjs');
      await settle();

      expect(trigger().textContent).toContain('nestjs');
      expect(trigger().textContent).not.toContain('Pick a topic');
    });

    it('looks like the text field: field tokens, not the old hard-coded colours', () => {
      const classes = trigger().classList;

      for (const token of ['rounded-control', 'border-line', 'bg-surface/60', 'text-fg']) {
        expect(classes).withContext(token).toContain(token);
      }
      expect(classes).not.toContain('bg-black/30');
    });

    it('keeps the panel closed until it is used', () => {
      expect(listbox()).toBeNull();
    });
  });

  describe('opening', () => {
    it('opens with Arrow Down', async () => {
      await openWithKeyboard();

      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(listbox()).not.toBeNull();
      expect(options().map((el) => el.textContent?.trim())).toEqual([
        'angular',
        'nestjs',
        'tailwind',
        'testing',
      ]);
    });

    it('opens with Arrow Up', async () => {
      trigger().focus();
      press('ArrowUp');
      await settle();

      expect(listbox()).not.toBeNull();
    });

    it('opens when the button is activated, which is what Enter and Space do', async () => {
      trigger().click();
      await settle();

      expect(listbox()).not.toBeNull();
      expect(active()).toBe(option('angular'));
    });

    it('does not open for unrelated keys', async () => {
      trigger().focus();
      press('x');
      await settle();

      expect(listbox()).toBeNull();
    });

    it('wires aria-controls to the listbox while open', async () => {
      await openWithKeyboard();

      expect(trigger().getAttribute('aria-controls')).toBe(listbox()!.id);
    });

    it('labels the listbox with the same label', async () => {
      await openWithKeyboard();

      const labelledBy = listbox()!.getAttribute('aria-labelledby')!;
      expect(document.getElementById(labelledBy)?.textContent?.trim()).toBe('Topic');
    });

    it('focuses the first option when nothing is selected', async () => {
      await openWithKeyboard();

      expect(active()).toBe(option('angular'));
    });

    it('focuses the selected option when there is one', async () => {
      host.value.set('tailwind');
      await settle();

      await openWithKeyboard();

      expect(active()).toBe(option('tailwind'));
      expect(option('tailwind').getAttribute('aria-selected')).toBe('true');
      expect(option('angular').getAttribute('aria-selected')).toBe('false');
    });

    it('marks the selected option with a check icon', async () => {
      host.value.set('nestjs');
      await settle();
      await openWithKeyboard();

      expect(option('nestjs').querySelector('svg')).not.toBeNull();
      expect(option('angular').querySelector('svg')).toBeNull();
    });

    it('matches the trigger width', async () => {
      await openWithKeyboard();

      // The visible surface, not just the CDK pane around it.
      const panel = listbox()!.parentElement!;
      expect(Math.round(panel.getBoundingClientRect().width)).toBe(
        Math.round(trigger().getBoundingClientRect().width)
      );
    });

    it('opens below the trigger when there is room', async () => {
      await openWithKeyboard();

      const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        trigger().getBoundingClientRect().bottom
      );
    });

    it('survives a value that is not among the options', async () => {
      host.value.set('unknown');
      await settle();

      await openWithKeyboard();

      expect(options().every((el) => el.getAttribute('aria-selected') === 'false')).toBeTrue();
      expect(active()).toBe(option('angular'));
    });
  });

  describe('navigating', () => {
    beforeEach(async () => {
      await openWithKeyboard();
    });

    it('moves the active option with the arrow keys', async () => {
      press('ArrowDown');
      await settle();
      expect(active()).toBe(option('nestjs'));
      expect(option('nestjs').classList).toContain('cdk-option-active');
      expect(option('angular').classList).not.toContain('cdk-option-active');

      press('ArrowDown');
      press('ArrowUp');
      await settle();
      expect(active()).toBe(option('nestjs'));
    });

    it('wraps around at the ends', async () => {
      press('ArrowUp');
      await settle();

      expect(active()).toBe(option('testing'));
    });

    it('jumps to the first and last options with Home and End', async () => {
      press('End');
      await settle();
      expect(active()).toBe(option('testing'));

      press('Home');
      await settle();
      expect(active()).toBe(option('angular'));
    });

    it('jumps to the option that starts with the typed letters', async () => {
      press('t');
      // The CDK waits for a pause in typing before it jumps.
      await new Promise((resolve) => setTimeout(resolve, 300));
      await settle();

      expect(active()).toBe(option('tailwind'));
    });

    it('does not change the value just by moving', async () => {
      press('ArrowDown');
      await settle();

      expect(host.changes).toEqual([]);
      expect(host.value()).toBe('');
    });
  });

  describe('selecting', () => {
    beforeEach(async () => {
      await openWithKeyboard();
    });

    it('selects the active option with Enter, closes and refocuses the trigger', async () => {
      press('ArrowDown');
      press('Enter');
      await settle();

      expect(host.changes).toEqual(['nestjs']);
      expect(listbox()).toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(active()).toBe(trigger());
      expect(trigger().textContent).toContain('nestjs');
    });

    it('selects with Space as well', async () => {
      press('End');
      press(' ');
      await settle();

      expect(host.changes).toEqual(['testing']);
      expect(listbox()).toBeNull();
      expect(active()).toBe(trigger());
    });

    it('selects with a click', async () => {
      option('tailwind').click();
      await settle();

      expect(host.changes).toEqual(['tailwind']);
      expect(listbox()).toBeNull();
      expect(active()).toBe(trigger());
    });

    it('closes without emitting when the current option is picked again', async () => {
      option('angular').click();
      await settle();
      expect(host.changes).toEqual(['angular']);

      trigger().click();
      await settle();
      press('Enter');
      await settle();

      expect(host.changes).toEqual(['angular']);
      expect(listbox()).toBeNull();
      expect(active()).toBe(trigger());
    });

    it('emits valueChange once per selection', async () => {
      press('ArrowDown');
      press('Enter');
      await settle();

      expect(host.changes.length).toBe(1);
    });
  });

  describe('closing', () => {
    beforeEach(async () => {
      await openWithKeyboard();
    });

    it('closes with Escape and returns focus to the trigger without selecting', async () => {
      press('ArrowDown');
      press('Escape');
      await settle();

      expect(listbox()).toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(active()).toBe(trigger());
      expect(host.changes).toEqual([]);
    });

    it('closes with Tab and keeps focus on the trigger, so Tab moves on from there', async () => {
      press('Tab');
      await settle();

      expect(listbox()).toBeNull();
      expect(active()).toBe(trigger());
    });

    it('closes on a click outside and leaves focus where the click put it', async () => {
      const after = root().querySelector<HTMLElement>('#after')!;
      after.focus();
      after.click();
      await settle();

      expect(listbox()).toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(active()).toBe(after);
    });

    it('closes when the trigger is clicked again', async () => {
      trigger().click();
      await settle();

      expect(listbox()).toBeNull();
    });

    it('stays open when a click lands on the panel padding', async () => {
      listbox()!.click();
      await settle();

      expect(listbox()).not.toBeNull();
    });

    it('can be reopened after closing', async () => {
      press('Escape');
      await settle();

      press('ArrowDown', trigger());
      await settle();

      expect(listbox()).not.toBeNull();
      expect(active()).toBe(option('angular'));
    });
  });

  describe('data changes', () => {
    it('reflects new options while open', async () => {
      await openWithKeyboard();

      host.options.set(['one', 'two']);
      await settle();

      expect(options().map((el) => el.textContent?.trim())).toEqual(['one', 'two']);
    });
  });

  describe('theme scope', () => {
    it('keeps the document theme for a normal select', async () => {
      await openWithKeyboard();

      expect(listbox()!.parentElement!.hasAttribute('data-theme')).toBeFalse();
    });

    it('takes the theme of the wrapper the select lives in', async () => {
      trigger('#scoped').focus();
      press('ArrowDown');
      await settle();

      expect(listbox()!.parentElement!.getAttribute('data-theme')).toBe('light');
    });
  });
});

describe('UiSelectComponent inside a dialog', () => {
  const dialog = () => document.querySelector('.cdk-dialog-container');
  const trigger = () =>
    document.querySelector<HTMLButtonElement>('#in-dialog button')!;
  const listbox = () => document.querySelector('[role="listbox"]');

  async function settle(): Promise<void> {
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
  }

  beforeEach(async () => {
    TestBed.inject(UiDialog).open(SelectDialogComponent);
    await settle();
  });

  afterEach(() => {
    TestBed.inject(Dialog).closeAll();
  });

  it('opens above the dialog and receives focus', async () => {
    trigger().focus();
    press('ArrowDown');
    await settle();

    expect(listbox()).not.toBeNull();
    expect(document.activeElement?.getAttribute('role')).toBe('option');
  });

  it('closes only the list on Escape, not the dialog', async () => {
    trigger().focus();
    press('ArrowDown');
    await settle();

    press('Escape');
    await settle();

    expect(listbox()).toBeNull();
    expect(dialog()).not.toBeNull();
    expect(document.activeElement).toBe(trigger());

    // A second Escape now reaches the dialog.
    press('Escape');
    await settle();
    expect(dialog()).toBeNull();
  });
});
