/*
This model defines the contact channels shown on the contact page. It is the single source of truth for the email address and the social channels.
*/

export interface ContactChannel {
  name: string;
  url: string;
  purpose: string;
  icon: string;
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
