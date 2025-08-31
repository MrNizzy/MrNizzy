import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  profileInfo,
  experienceItems,
  socialLinks,
  tools,
  projects,
  ProfileInfo,
  ExperienceItem,
  SocialLink,
  Tool,
  Project,
} from './data';
import { HeroBannerComponent } from '@components/hero-banner/hero-banner.component';
import { WorkExperienceComponent } from '@components/work-experience/work-experience.component';
import { LearningExperienceComponent } from '@components/learning-experience/learning-experience.component';
import { TechStackComponent } from '@components/tech-stack/tech-stack.component';
import { ScrollFadeInDirective } from '@app/core/directives/scroll-fade-in.directive';
import { SocialNetworkComponent } from '@app/components/social-network/social-network.component';

@Component({
  selector: 'app-home',
  imports: [
    HeroBannerComponent,
    WorkExperienceComponent,
    LearningExperienceComponent,
    TechStackComponent,
    ScrollFadeInDirective,
    SocialNetworkComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  // Señales para los datos
  readonly profile = signal<ProfileInfo>(profileInfo);
  readonly experience = signal<ExperienceItem[]>(experienceItems);
  readonly social = signal<SocialLink[]>(socialLinks);
  readonly toolGroups = signal<Tool[][]>(tools);
  readonly projectList = signal<Project[]>(projects);
}
