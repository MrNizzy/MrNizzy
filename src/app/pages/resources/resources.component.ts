import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiDialog } from '@shared/ui/dialog/dialog.service';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiInputDirective } from '@shared/ui/input/input.directive';
import { UiLinkDirective } from '@shared/ui/link/link.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';
import { UiSelectComponent } from '@shared/ui/select/select.component';
import { ResourceDialogComponent } from './resource-dialog.component';
import type { Resource } from './resource.model';
import { RESOURCE_CATALOG } from './resources.data';

const ALL = 'all';

/** A little wider than the dialog default: the details have room to breathe. */
const DIALOG_WIDTH = 'min(40rem, calc(100vw - 2rem))';

@Component({
  selector: 'app-resources',
  imports: [
    RouterLink,
    UiButtonDirective,
    UiCardDirective,
    UiChipDirective,
    UiIconComponent,
    UiInputDirective,
    UiLinkDirective,
    UiSectionHeadingComponent,
    UiSelectComponent,
  ],
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent {
  private readonly dialog = inject(UiDialog);
  private readonly injector = inject(Injector);

  readonly items: readonly Resource[] = inject(RESOURCE_CATALOG);

  // Filters
  readonly search = signal('');
  readonly type = signal<string>(ALL);
  readonly category = signal<string>(ALL);

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Distinct lists derived from the catalog.
  readonly types = computed<string[]>(() => {
    const set = new Set(this.items.map((r) => r.type).filter(Boolean));
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });
  readonly categories = computed<string[]>(() => {
    const set = new Set(this.items.map((r) => r.category).filter(Boolean));
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });

  // Filtered items according to current filters
  readonly filteredItems = computed<readonly Resource[]>(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.type();
    const c = this.category();
    return this.items.filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some((tag) => tag.toLowerCase().includes(q));
      const matchesType = t === ALL || r.type === t;
      const matchesCategory = c === ALL || r.category === c;
      return matchesSearch && matchesType && matchesCategory;
    });
  });

  /** What the page shows: an empty catalog gets its own message instead of filters. */
  readonly view: 'empty' | 'ready' = this.items.length === 0 ? 'empty' : 'ready';

  /** Result count, announced politely after every filter change. */
  readonly resultsLabel = computed(() => {
    const shown = this.filteredItems().length;
    const total = this.items.length;
    const noun = total === 1 ? 'resource' : 'resources';
    return shown === total
      ? `Showing ${total} ${noun}`
      : `Showing ${shown} of ${total} ${noun}`;
  });

  clearSearch() {
    this.search.set('');
    // The clear button disappears with the text; keep typing where it was.
    this.searchInput()?.nativeElement.focus();
  }

  clearFilters() {
    this.search.set('');
    this.type.set(ALL);
    this.category.set(ALL);
    // The button that was used disappears with the "no matches" message.
    afterNextRender(() => this.searchInput()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  openResource(r: Resource) {
    this.dialog.open<void, Resource, ResourceDialogComponent>(
      ResourceDialogComponent,
      { data: r, width: DIALOG_WIDTH }
    );
  }
}
