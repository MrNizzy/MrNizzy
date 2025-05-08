import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  profileInfo,
  experienceItems,
  socialLinks,
  tools,
  projects,
  workExperiences,
  ProfileInfo,
  ExperienceItem,
  SocialLink,
  Tool,
  Project,
  WorkExperience,
} from './data';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { WorkExperienceComponent } from '../../components/work-experience/work-experience.component';
import { LearningExperienceComponent } from '../../components/learning-experience/learning-experience.component';
import { TechStackComponent } from '../../components/tech-stack/tech-stack.component';
import { ProjectShowcaseComponent } from '../../components/project-showcase/project-showcase.component';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { ScrollFadeInDirective } from '@app/core/directives/scroll-fade-in.directive';

@Component({
  selector: 'app-home',
  imports: [
    HeroBannerComponent,
    WorkExperienceComponent,
    LearningExperienceComponent,
    TechStackComponent,
    ProjectShowcaseComponent,
    SiteFooterComponent,
    ScrollFadeInDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // Señales para los datos
  readonly profile = signal<ProfileInfo>(profileInfo);
  readonly experience = signal<ExperienceItem[]>(experienceItems);
  readonly work = signal<WorkExperience[]>(workExperiences);
  readonly social = signal<SocialLink[]>(socialLinks);
  readonly toolGroups = signal<Tool[][]>(tools);
  readonly projectList = signal<Project[]>(projects);
}
