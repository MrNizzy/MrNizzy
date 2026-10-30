import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCardDirective } from '@shared/ui/card/card.directive';
import { UiChipDirective } from '@shared/ui/chip/chip.directive';
import { UiIconComponent } from '@shared/ui/icon/icon.component';
import { UiLinkDirective } from '@shared/ui/link/link.directive';
import { UiSectionHeadingComponent } from '@shared/ui/section-heading/section-heading.component';

interface OnlineProfile {
  readonly name: string;
  readonly purpose: string;
  readonly url: string;
}

const YOUTUBE_CHANNEL_URL =
  'https://www.youtube.com/channel/UCFjfIk29NqqPGmrCfCV14Yg';

@Component({
  selector: 'app-about',
  imports: [
    RouterLink,
    UiCardDirective,
    UiChipDirective,
    UiIconComponent,
    UiLinkDirective,
    UiSectionHeadingComponent,
  ],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  readonly skills: readonly string[] = [
    'Angular',
    'TypeScript',
    'NestJS',
    'SQL',
    'Python',
    'HTML/CSS',
    'SASS',
    'Git',
    'Linux',
    'Docker',
  ];

  readonly youtubeUrl = 'https://www.youtube.com/@MrNizzy';

  readonly profiles: readonly OnlineProfile[] = [
    {
      name: 'GitHub',
      purpose: 'Repositories, most starred first',
      url: 'https://github.com/MrNizzy?tab=repositories&sort=stargazers',
    },
    {
      name: 'GitHub followers',
      purpose: 'Follow me on GitHub',
      url: 'https://github.com/MrNizzy?tab=followers',
    },
    {
      name: 'YouTube',
      purpose: 'Subscribe to my channel',
      url: `${YOUTUBE_CHANNEL_URL}?sub_confirmation=1`,
    },
    {
      name: 'daily.dev',
      purpose: 'My developer card',
      url: 'https://app.daily.dev/mrnizzy',
    },
  ];
}
