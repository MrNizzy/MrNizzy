import { InjectionToken } from '@angular/core';
import type { Resource } from './resource.model';

/** The catalog shown on the Resources page: adding a resource means adding an object here. */
export const resources: readonly Resource[] = [
  {
    id: 'iconify',
    name: 'Iconify',
    url: 'https://icon-sets.iconify.design/',
    description:
      'Searchable catalog of open source vector icons from many icon sets, usable in web projects through one unified API.',
    type: 'Library',
    category: 'Icons',
    tags: ['icons', 'svg', 'open source'],
    repository: 'https://github.com/iconify/iconify',
  },
  {
    id: 'react-bits',
    name: 'React Bits',
    url: 'https://www.reactbits.dev/',
    description:
      'Free, open source animated and interactive React components for building creative websites.',
    type: 'Library',
    category: 'UI components',
    tags: ['react', 'animation', 'components'],
    repository: 'https://github.com/DavidHDev/react-bits',
  },
  {
    id: 'angular-material',
    name: 'Angular Material',
    url: 'https://material.angular.dev/',
    description:
      'Material Design UI components and component infrastructure for Angular applications, by the Angular team.',
    type: 'Library',
    category: 'UI components',
    tags: ['angular', 'material design', 'components'],
    repository: 'https://github.com/angular/components',
  },
  {
    id: 'daisyui',
    name: 'daisyUI',
    url: 'https://daisyui.com/components/',
    description:
      'Tailwind CSS component library with semantic class names, so UI does not need long lists of utilities.',
    type: 'Library',
    category: 'UI components',
    tags: ['tailwindcss', 'css', 'components'],
    repository: 'https://github.com/saadeghi/daisyui',
  },
  {
    id: 'primeng',
    name: 'PrimeNG',
    url: 'https://primeng.dev/',
    description:
      'Collection of accessible, design-agnostic UI components and themes for Angular.',
    type: 'Library',
    category: 'UI components',
    tags: ['angular', 'components', 'themes'],
    repository: 'https://github.com/primefaces/primeng',
  },
  {
    id: 'carmen-ansio-articles',
    name: 'Carmen Ansio’s articles',
    url: 'https://www.carmenansio.com/articles/',
    description:
      'Articles on CSS, animation, design systems and frontend engineering by Carmen Ansio.',
    type: 'Blog',
    category: 'CSS',
    tags: ['css', 'animation', 'design systems'],
  },
  {
    id: 'chrome-carousel-gallery',
    name: 'Carousel Gallery',
    url: 'https://chrome.dev/carousel/',
    description:
      'Gallery of carousel demos built with CSS alone, no JavaScript, by Adam Argyle from the Chrome team.',
    type: 'Gallery',
    category: 'CSS',
    tags: ['css', 'carousel', 'demos'],
    repository:
      'https://github.com/GoogleChromeLabs/css-web-ui-demos/tree/main/carousels-gallery',
  },
  {
    id: 'caniuse',
    name: 'Can I use',
    url: 'https://caniuse.com/',
    description:
      'Browser support tables for HTML, CSS and JavaScript features across desktop and mobile browsers.',
    type: 'Reference',
    category: 'Browser support',
    tags: ['compatibility', 'css', 'html'],
    repository: 'https://github.com/Fyrd/caniuse',
  },
  {
    id: 'canirun-ai',
    name: 'CanIRun.ai',
    url: 'https://canirun.ai/',
    description:
      'Detects your hardware in the browser and shows which open AI models can run locally on it.',
    type: 'Tool',
    category: 'AI',
    tags: ['ai', 'llm', 'hardware'],
    repository: 'https://github.com/midudev/canirun.ai',
  },
  {
    id: 'can-you-run-it',
    name: 'Can You RUN It',
    url: 'https://www.systemrequirementslab.com/cyri',
    description:
      'Checks your PC against the system requirements of a game to tell whether it will run.',
    type: 'Tool',
    category: 'Hardware',
    tags: ['gaming', 'pc', 'system requirements'],
  },
];

/** Injection point for the catalog, so specs can provide fixtures. */
export const RESOURCE_CATALOG = new InjectionToken<readonly Resource[]>(
  'RESOURCE_CATALOG',
  { providedIn: 'root', factory: () => resources }
);
