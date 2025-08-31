import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { WorkExperience } from '@pages/home/data';
import { ScrollFadeInDirective } from '@app/core/directives/scroll-fade-in.directive';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-work-experience',
  imports: [ScrollFadeInDirective, MatIconModule],
  templateUrl: './work-experience.component.html',
  styleUrl: './work-experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkExperienceComponent {
  public readonly works = signal<WorkExperience[]>([
    {
      position: 'Frontend Developer - Angular',
      company: `WittyPlus`,
      period: `July 2025 — Present (${this.calculateMonthsBetween(
        new Date(),
        new Date(2025, 6)
      )} months)`,
      description:
        'Built micro-frontend applications with Angular integrated with RESTful APIs. Applied best practices and performance optimizations. Collaborated in agile rituals (code reviews, sprint planning). Created a reusable UI component library with Angular and DaisyUI to improve consistency and delivery speed.',
    },
    {
      position: 'Freelance Developer - Ionic (Angular) / NestJS',
      company: 'Independent',
      period: `August 2024 — July 2025 (${this.calculateMonthsBetween(
        new Date(2025, 7),
        new Date(2024, 7)
      )} months)`,
      description:
        'Fullstack and mobile. Creator of Caffy (Android, Ionic). Applied architecture patterns to improve performance, network usage, and session security. Designed branding and UI/UX (logos, themes).',
    },
    {
      position: 'Fullstack Developer',
      company: 'WEBCLOSTER S.A.S.',
      period: 'March 2023 — August 2024 (17 months)',
      description:
        'Led the migration of Invessoft to a decoupled architecture (Angular + NestJS), cutting load times ~50% and improving quality >40%. Provisioned VPS for deployment (domain, subdomains, Nginx, PM2). Led Frontend and improved UI/UX >40%. Supported MySQL→PostgreSQL migration (normalization, schema design). Scaled permissions/roles and reduced technical debt >65%. Built a certificate generation API for research events.',
    },
    {
      position: 'Freelance Developer',
      company: 'Lt-Automation',
      period: 'April 2020 — June 2020 (2 months)',
      description:
        'Built a new landing page, improving accessibility and UX by ~80% per client specs. Modernized HTML5/CSS3, replacing deprecated elements (~35%). Added responsive design for mobile, tablet, and desktop.',
    },
  ]);

  private calculateMonthsBetween(startDate: Date, endDate: Date): number {
    const yearsDifference = endDate.getFullYear() - startDate.getFullYear();
    const monthsDifference = endDate.getMonth() - startDate.getMonth();
    return Math.abs(yearsDifference * 12 + monthsDifference);
  }
}
