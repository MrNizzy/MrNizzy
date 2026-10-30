import { Dialog } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ICON_NAMES } from '@shared/ui';
import { UiKitComponent } from './ui-kit.component';

describe('UiKitComponent', () => {
  let fixture: ComponentFixture<UiKitComponent>;
  let root: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(UiKitComponent);
    fixture.detectChanges();
    root = fixture.nativeElement;
  });

  it('renders a light-theme preview scoped to its own wrapper', () => {
    const light = root.querySelector('[data-theme="light"]');

    expect(light).not.toBeNull();
    expect(light?.querySelector('button')).not.toBeNull();
    expect(light?.querySelector('input')).not.toBeNull();
  });

  it('shows the same showcase in the active and the light theme', () => {
    const light = root.querySelector('[data-theme="light"]') as HTMLElement;
    const total = root.querySelectorAll('button').length;
    const inLight = light.querySelectorAll('button').length;

    expect(inLight).toBeGreaterThan(0);
    expect(total).toBe(inLight * 2);
  });

  it('lists every registered icon', () => {
    const text = root.textContent ?? '';

    for (const name of ICON_NAMES) {
      expect(text).withContext(name).toContain(name);
    }
  });

  it('toggles a chip between pressed and not pressed', () => {
    const chip = () =>
      root.querySelector('[role="group"] button') as HTMLButtonElement;
    const initial = chip().getAttribute('aria-pressed');

    chip().click();
    fixture.detectChanges();

    expect(chip().getAttribute('aria-pressed')).not.toBe(initial);
  });

  it('marks the invalid input with aria-invalid', () => {
    expect(root.querySelector('input[aria-invalid="true"]')).not.toBeNull();
  });

  describe('select and dialog demos', () => {
    const openers = () =>
      Array.from(root.querySelectorAll('button')).filter(
        (button) => button.textContent?.trim() === 'Open dialog'
      );

    async function settle(): Promise<void> {
      fixture.detectChanges();
      TestBed.tick();
      await fixture.whenStable();
      fixture.detectChanges();
      TestBed.tick();
    }

    afterEach(() => {
      TestBed.inject(Dialog).closeAll();
    });

    it('shows both in the active theme and in the light preview', () => {
      const light = root.querySelector('[data-theme="light"]') as HTMLElement;

      expect(root.querySelectorAll('app-ui-select').length).toBe(2);
      expect(light.querySelectorAll('app-ui-select').length).toBe(1);
      expect(openers().length).toBe(2);
      expect(openers().filter((button) => light.contains(button)).length).toBe(1);
    });

    it('opens the demo dialog from the primary button and reports its result', async () => {
      openers()[0].focus();
      openers()[0].click();
      await settle();

      const dialog = document.querySelector('app-ui-kit-demo-dialog');
      expect(dialog).not.toBeNull();
      const actions = Array.from(dialog!.querySelectorAll('footer button'));
      expect(actions.map((button) => button.textContent?.trim())).toEqual([
        'Cancel',
        'Confirm',
      ]);

      (actions[1] as HTMLButtonElement).click();
      await settle();

      expect(document.querySelector('app-ui-kit-demo-dialog')).toBeNull();
      expect(root.textContent).toContain('confirmed');
      expect(document.activeElement).toBe(openers()[0]);
    });

    it('opens the dialog inside the light preview with the light tokens', async () => {
      openers()[1].focus();
      openers()[1].click();
      await settle();

      expect(
        document.querySelector('app-ui-dialog')?.getAttribute('data-theme')
      ).toBe('light');
    });

    it('changes the selected topic from the select', async () => {
      const trigger = root.querySelector('app-ui-select button') as HTMLButtonElement;
      trigger.click();
      await settle();

      const option = Array.from(
        document.querySelectorAll<HTMLElement>('[role="option"]')
      ).find((el) => el.textContent?.trim() === 'NestJS')!;
      option.click();
      await settle();

      expect(trigger.textContent).toContain('NestJS');
      expect(root.textContent).toContain('Selected: NestJS');
    });
  });
});
