import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * "Stack" eyebrow followed by a dot-separated list of technologies, shown as
 * plain muted text rather than chips.
 */
@Component({
  selector: 'app-ui-stack-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid gap-1' },
  template: `
    <!-- The list carries its own accessible name, so the visible label is hidden from AT. -->
    <p
      class="text-xs font-semibold uppercase tracking-wider text-fg-subtle"
      aria-hidden="true"
    >
      Stack
    </p>
    <!-- The separator dots are drawn on ::before (no text), so nothing extra is read out. -->
    <!-- Every item draws its dot in the gap before it; the list is pulled
         left by one gap and clipped, so the dot that starts each line
         (the first one, and any after a wrap) is hidden. -->
    <div class="overflow-hidden">
      <ul
        class="-ml-5 flex flex-wrap gap-y-1 text-sm text-fg-muted"
        aria-label="Tech stack"
        role="list"
      >
        @for (item of items(); track $index) {
          <li
            class="relative whitespace-nowrap pl-5 before:absolute before:top-1/2 before:left-2 before:size-1 before:-translate-y-1/2 before:rounded-full before:bg-fg-subtle forced-colors:before:bg-[CanvasText]"
          >
            {{ item }}
          </li>
        }
      </ul>
    </div>
  `,
})
export class UiStackListComponent {
  /** Technologies, in display order. */
  public readonly items = input.required<readonly string[]>();
}
