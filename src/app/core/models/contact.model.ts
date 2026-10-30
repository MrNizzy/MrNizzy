/*
This model defines the contact channels shown on the contact page. It is the single source of truth for the email address and the social channels.
*/

import type { IconName } from '@shared/ui/icon/icon.registry';

export interface ContactChannel {
  name: string;
  url: string;
  purpose: string;
  /** Path to the brand mark asset, drawn as an image. */
  icon: string;
  /**
   * Set for channels whose brand mark is a single-colour glyph. The icon
   * registry draws it in `currentColor` instead of the white SVG asset, which
   * would disappear on a light surface.
   */
  registryIcon?: IconName;
}

export const CONTACT_EMAIL = 'mr.nizzy@proton.me';

export const CONTACT_EMAIL_SUBJECT = 'Hello Brallan';

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/mrnizzy/',
    purpose: 'Experience and proposals',
    icon: './icons/linkedin.svg',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/MrNizzy',
    purpose: 'Code and open source',
    icon: './icons/github.svg',
    registryIcon: 'github',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@MrNizzy',
    purpose: 'Tutorials and videos',
    icon: './icons/youtube.svg',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/mr.nizzy',
    purpose: 'Direct messages',
    icon: './icons/instagram.svg',
  },
];
