import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
  input,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-ui-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
        @if (label()) {
            <span class="block text-xs uppercase opacity-70 mb-1">{{ label() }}</span>
        }
      <button
        type="button"
        class="w-full px-3 py-2 rounded-lg border border-white/10 bg-black/30 text-left flex items-center justify-between gap-2 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/20"
        (click)="toggleOpen()"
        (keydown.enter)="toggleOpen()"
        (keydown.space)="toggleOpen()"
        [attr.aria-expanded]="open()"
        [attr.aria-haspopup]="'listbox'"
      >
        <span class="truncate capitalize">{{ value() || placeholder() || 'Select' }}</span>
        <span class="ml-auto opacity-70">▾</span>
      </button>

      @if (open()) {
      <div
        class="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl overflow-hidden"
        role="listbox"
      >
        <ul class="max-h-60 overflow-auto">
          @for (opt of options(); track opt) {
          <li
            (click)="onSelect(opt)"
            (keydown.enter)="onSelect(opt)"
            (keydown.space)="onSelect(opt)"
            tabindex="0"
            class="px-3 py-2 cursor-pointer hover:bg-white/10 capitalize flex items-center justify-between"
            [class.bg-white/10]="opt === value()"
            role="option"
            [attr.aria-selected]="opt === value()"
            title="{{ opt }}"
          >
            <span class="truncate">{{ opt }}</span>
            @if (opt === value()) {
            <span class="opacity-80">✓</span>
            }
          </li>
          }
        </ul>
      </div>
    }
    </div>
  `,
})
export class UiSelectComponent {
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<string[]>([]);
  readonly value = input('');
  @Output() valueChange = new EventEmitter<string>();

  readonly open = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);

  toggleOpen() {
    this.open.update((o) => !o);
  }

  onSelect(val: string) {
    this.valueChange.emit(val);
    this.open.set(false);
  }

  trackByOpt = (_: number, opt: string) => opt;

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent) {
    const el = this.host.nativeElement;
    if (!el.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
