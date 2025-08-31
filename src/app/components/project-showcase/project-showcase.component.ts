import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Project, projects } from '../../pages/home/data';

@Component({
  selector: 'app-project-showcase',
  imports: [MatIconModule, MatButtonModule, NgOptimizedImage],
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

  public readonly filteredProjects = computed<Project[]>(() => {
    const sel = this.selectedCategory();
    if (!sel || sel === 'All') return this.projects();
    return this.projects().filter((p) => (p.categories ?? []).includes(sel));
  });

  public setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }
}
