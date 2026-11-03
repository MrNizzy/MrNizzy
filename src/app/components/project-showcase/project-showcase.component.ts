import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { Project, projects } from '@pages/home/data';
import { UiButtonDirective } from '@shared/ui/button/button.directive';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import {
  SCREENSHOT_SIZES,
  ScreenshotSources,
  screenshotSources,
} from './project-screenshot';

const GITHUB_HOSTS: ReadonlySet<string> = new Set([
  'github.com',
  'www.github.com',
]);

@Component({
  selector: 'app-project-showcase',
  imports: [UiButtonDirective, UiCardDirective, UiChipDirective, UiIconComponent],
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

  /** Links to GitHub get the GitHub mark; every other destination gets an arrow. */
  protected isGithub(url: string): boolean {
    try {
      return GITHUB_HOSTS.has(new URL(url).hostname);
    } catch {
      return false;
    }
  }
}
