import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceApi } from './resource-api';
import type { Resource } from './resource.model';
import { UiSelectComponent } from '@app/components/ui-select/ui-select.component';
import { ResourceDialogComponent } from './resource-dialog.component';

@Component({
  selector: 'app-resources',
  imports: [FormsModule, UiSelectComponent, ResourceDialogComponent],
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourcesComponent {
  private resourceApi = inject(ResourceApi);

  readonly resources = this.resourceApi.getResources();

  // Filters
  readonly search = signal('');
  readonly type = signal<string>('all');
  readonly category = signal<string>('all');

  // Distinct lists derived from fetched items
  readonly items = computed<Resource[]>(
    () => this.resources.value().items ?? []
  );
  readonly types = computed<string[]>(() => {
    const set = new Set(
      this.items()
        .map((r) => r.type)
        .filter(Boolean)
    );
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });
  readonly categories = computed<string[]>(() => {
    const set = new Set(
      this.items()
        .map((r) => r.category)
        .filter(Boolean)
    );
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });

  // Filtered items according to current filters
  readonly filteredItems = computed<Resource[]>(() => {
    const q = this.search().trim().toLowerCase();
    const t = this.type();
    const c = this.category();
    return this.items().filter((r) => {
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags?.some((tag) => tag.toLowerCase().includes(q));
      const matchesType = t === 'all' || r.type === t;
      const matchesCategory = c === 'all' || r.category === c;
      return matchesSearch && matchesType && matchesCategory;
    });
  });

  // Modal state for selected resource id
  readonly selectedId = signal<string | null>(null);

  openResource = (r: Resource) => {
    this.selectedId.set(r.resource_id);
  };

  closeResource = () => {
    this.selectedId.set(null);
  };
}
