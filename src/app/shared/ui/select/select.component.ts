import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { UiIconComponent } from '../icon/icon.component';
import { themeScopeOf } from '../theme-scope';
import { FIELD } from '../ui-classes';

let nextId = 0;

const TRIGGER = `${FIELD} flex cursor-pointer items-center justify-between gap-2 text-left aria-expanded:border-accent`;

// The CDK pane is a flex row, so the panel needs w-full to fill the trigger width.
const PANEL =
  'w-full overflow-hidden rounded-control border border-line bg-surface text-fg shadow-[var(--ds-shadow-card)]';

const OPTION =
  'flex cursor-pointer items-center justify-between gap-2 rounded-chip px-3 py-2 text-fg outline-hidden hover:bg-fg/5 focus:bg-fg/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** Below the trigger, flipping above it when there is no room. */
const POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];

/**
 * Single-choice select built on the CDK listbox and a connected overlay.
 *
 * The trigger is a button that opens a listbox. Arrow Down or Up (and the
 * native Enter and Space activation) open it with the selected option, or the
 * first, focused. Inside the list the arrow keys, Home, End and typeahead move
 * between options; Enter, Space or a click select and return focus to the
 * trigger. Escape and Tab close it, and an outside click does too.
 *
 * `value` is a two-way model, so both `[value]` with `(valueChange)` and
 * `[(value)]` work.
 */
@Component({
  selector: 'app-ui-select',
  imports: [
    CdkConnectedOverlay,
    CdkListbox,
    CdkOption,
    CdkOverlayOrigin,
    UiIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (label(); as text) {
      <span [id]="labelId" class="mb-1 block text-xs uppercase text-fg-muted">
        {{ text }}
      </span>
    }

    <button
      #trigger
      type="button"
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [id]="triggerId"
      [class]="triggerClasses"
      aria-haspopup="listbox"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? listboxId : null"
      [attr.aria-labelledby]="label() ? labelId + ' ' + triggerId : null"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="truncate capitalize">{{ display() }}</span>
      <app-ui-icon
        name="chevron-down"
        [size]="16"
        class="text-fg-subtle motion-safe:transition-transform"
        [class.rotate-180]="open()"
      />
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayWidth]="panelWidth()"
      [cdkConnectedOverlayDisableClose]="true"
      (overlayKeydown)="onOverlayKeydown($event)"
      (overlayOutsideClick)="close(false)"
      (attach)="onAttach()"
      (detach)="open.set(false)"
    >
      <div [class]="panelClasses" [attr.data-theme]="themeScope()">
        <div
          cdkListbox
          [id]="listboxId"
          [cdkListboxValue]="selection()"
          [attr.aria-label]="label() ? null : placeholder() || 'Options'"
          [attr.aria-labelledby]="label() ? labelId : null"
          class="max-h-60 overflow-y-auto p-1 outline-hidden"
        >
          @for (option of options(); track option) {
            <!--
              The CDK only reports a selection when it changes, so picking the
              current option again would not close the list. Handling the pick
              here makes every pick close it. Keys land on the focused option.
            -->
            <div
              [cdkOption]="option"
              tabindex="0"
              [class]="optionClasses"
              [attr.title]="option"
              (click)="commit(option)"
              (keydown.enter)="commit(option)"
              (keydown.space)="commit(option)"
            >
              <span class="truncate capitalize">{{ option }}</span>
              @if (option === value()) {
                <app-ui-icon name="check" [size]="16" class="text-accent" />
              }
            </div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class UiSelectComponent {
  /** Visible caption above the trigger. Also names the trigger and the list. */
  readonly label = input('');
  /** Shown in the trigger while no option is selected. */
  readonly placeholder = input('');
  readonly options = input<string[]>([]);
  /** The selected option. Emits `valueChange` when the user picks another one. */
  readonly value = model('');

  protected readonly open = signal(false);
  protected readonly panelWidth = signal(0);
  protected readonly themeScope = signal<string | null>(null);

  private readonly uid = nextId++;
  protected readonly triggerId = `app-ui-select-trigger-${this.uid}`;
  protected readonly listboxId = `app-ui-select-listbox-${this.uid}`;
  protected readonly labelId = `app-ui-select-label-${this.uid}`;

  protected readonly triggerClasses = TRIGGER;
  protected readonly panelClasses = PANEL;
  protected readonly optionClasses = OPTION;
  protected readonly positions = POSITIONS;

  protected readonly display = computed(
    () => this.value() || this.placeholder() || 'Select'
  );

  /**
   * The CDK listbox throws in development when its value matches no option,
   * which is the case for the empty default, so only pass a real option.
   */
  protected readonly selection = computed(() => {
    const current = this.value();
    return this.options().includes(current) ? [current] : [];
  });

  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listbox = viewChild(CdkListbox);
  private readonly injector = inject(Injector);

  protected toggle(): void {
    if (this.open()) {
      // Restore focus: Safari doesn't focus a button on click.
      this.close(true);
    } else {
      this.openPanel();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.openPanel();
    }
  }

  /** Receives keys through the CDK dispatcher, so only the topmost overlay sees them. */
  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    } else if (event.key === 'Tab') {
      // Focus goes back to the trigger first, so Tab continues from there.
      this.close(true);
    }
  }

  protected commit(option: string): void {
    if (option !== this.value()) this.value.set(option);
    this.close(true);
  }

  protected onAttach(): void {
    // Wait for the render so the list is in the DOM and positioned. Focusing
    // the listbox makes the CDK focus the selected option, or the first one.
    afterNextRender(() => this.listbox()?.focus(), {
      injector: this.injector,
    });
  }

  private openPanel(): void {
    const trigger = this.trigger().nativeElement;
    this.panelWidth.set(trigger.offsetWidth);
    this.themeScope.set(themeScopeOf(trigger));
    this.open.set(true);
  }

  /**
   * @param restoreFocus return focus to the trigger. Not wanted after an outside
   * click, where focus belongs to whatever the user clicked.
   */
  protected close(restoreFocus: boolean): void {
    this.open.set(false);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }
}
