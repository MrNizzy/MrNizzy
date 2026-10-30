import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { Project, projects } from '@pages/home/data';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiLinkDirective } from '@shared/ui/link/link.directive';
import {
  SCREENSHOT_SIZES,
  ScreenshotSources,
  screenshotSources,
} from './project-screenshot';

@Component({
  selector: 'app-project-showcase',
  imports: [UiCardDirective, UiChipDirective, UiIconComponent, UiLinkDirective],
  templateUrl: './project-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectShowcaseComponent {
  public readonly projects = signal<Project[]>(projects);

  // unique categories from data, include 'All'
  public readonly categories = computed<string[]>(() => {
    const set = new Set<string>();
    for (const p of this.projects()) {
      (p.categories ?? []).forEach((c) => set.add(c));
    }
    return ['All', ...Array.from(set).sort()];
  });

  public readonly selectedCategory = signal<string>('All');

  protected readonly screenshotSizes = SCREENSHOT_SIZES;

  public readonly filteredProjects = computed<Project[]>(() => {
    const sel = this.selectedCategory();
    if (!sel || sel === 'All') return this.projects();
    return this.projects().filter((p) => (p.categories ?? []).includes(sel));
  });

  /** Result count, announced politely after every filter change. */
  public readonly resultsLabel = computed(() => {
    const count = this.filteredProjects().length;
    return `Showing ${count} ${count === 1 ? 'project' : 'projects'}`;
  });

  public setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  protected screenshot(project: Project): ScreenshotSources {
    return screenshotSources(project);
  }
}
