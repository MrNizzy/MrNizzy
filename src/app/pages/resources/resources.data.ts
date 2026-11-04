import { InjectionToken } from '@angular/core';
import type { Resource } from './resource.model';

/** The catalog shown on the Resources page: adding a resource means adding an object here. */
export const resources: readonly Resource[] = [
  {
    id: 'iconify',
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
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
    added: '2026-11-04',
    name: 'Can You RUN It',
    url: 'https://www.systemrequirementslab.com/cyri',
    description:
      'Checks your PC against the system requirements of a game to tell whether it will run.',
    type: 'Tool',
    category: 'Hardware',
    tags: ['gaming', 'pc', 'system requirements'],
  },
  {
    id: 'spartan',
    added: '2026-11-04',
    name: 'spartan',
    url: 'https://spartan.ng/',
    description:
      'Accessible Angular UI primitives with styles you copy in and customize to build your own component library.',
    type: 'Library',
    category: 'UI components',
    tags: ['angular', 'components', 'accessibility'],
    repository: 'https://github.com/spartan-ng/spartan',
  },
  {
    id: 'shadcn-ui',
    added: '2026-11-04',
    name: 'shadcn/ui',
    url: 'https://ui.shadcn.com/',
    description:
      'Accessible React components you copy into your project and customize, with a CLI to add them.',
    type: 'Library',
    category: 'UI components',
    tags: ['react', 'components', 'accessibility'],
    repository: 'https://github.com/shadcn-ui/ui',
  },
  {
    id: 'modern-css-solutions',
    added: '2026-11-04',
    name: 'Modern CSS Solutions',
    url: 'https://moderncss.dev/',
    description:
      'Articles by Stephanie Eckles on modern CSS techniques that replace old workarounds.',
    type: 'Blog',
    category: 'CSS',
    tags: ['css', 'layout', 'tutorials'],
  },
  {
    id: 'josh-w-comeau',
    added: '2026-11-04',
    name: 'Josh W. Comeau’s blog',
    url: 'https://www.joshwcomeau.com/',
    description:
      'In-depth, interactive tutorials on CSS, animation, React, JavaScript and SVG.',
    type: 'Blog',
    category: 'CSS',
    tags: ['css', 'animation', 'react'],
  },
  {
    id: 'oklch-color-picker',
    added: '2026-11-04',
    name: 'OKLCH Color Picker',
    url: 'https://oklch.com/',
    description:
      'Picks colors in the OKLCH color space and converts HEX, RGB or HSL values to OKLCH, by Evil Martians.',
    type: 'Tool',
    category: 'Design',
    tags: ['color', 'oklch', 'css'],
    repository: 'https://github.com/evilmartians/oklch-picker',
  },
  {
    id: 'utopia',
    added: '2026-11-04',
    name: 'Utopia',
    url: 'https://utopia.fyi/',
    description:
      'Calculators for fluid type, space and grid scales that grow smoothly with the viewport width.',
    type: 'Tool',
    category: 'Design',
    tags: ['fluid design', 'typography', 'spacing'],
  },
  {
    id: 'aria-apg',
    added: '2026-11-04',
    name: 'ARIA Authoring Practices Guide',
    url: 'https://www.w3.org/WAI/ARIA/apg/',
    description:
      'W3C guide to building accessible widgets and design patterns with ARIA, with working examples.',
    type: 'Reference',
    category: 'Accessibility',
    tags: ['accessibility', 'aria', 'patterns'],
    repository: 'https://github.com/w3c/aria-practices',
  },
  {
    id: 'pagespeed-insights',
    added: '2026-11-04',
    name: 'PageSpeed Insights',
    url: 'https://pagespeed.web.dev/',
    description:
      'Google tool that analyzes the performance of a web page and suggests how to make it faster.',
    type: 'Tool',
    category: 'Performance',
    tags: ['performance', 'web vitals', 'lighthouse'],
  },
  {
    id: 'squoosh',
    added: '2026-11-04',
    name: 'Squoosh',
    url: 'https://squoosh.app/',
    description:
      'Compresses and converts images in the browser, without uploading them, with a side-by-side comparison.',
    type: 'Tool',
    category: 'Performance',
    tags: ['images', 'compression', 'webp'],
    repository: 'https://github.com/GoogleChromeLabs/squoosh',
  },
  {
    id: 'regex101',
    added: '2026-11-04',
    name: 'regex101',
    url: 'https://regex101.com/',
    description:
      'Tests, explains and debugs regular expressions across several flavors, and generates code for them.',
    type: 'Tool',
    category: 'Debugging',
    tags: ['regex', 'debugging', 'testing'],
  },
  {
    id: 'ollama',
    added: '2026-11-04',
    name: 'Ollama',
    url: 'https://ollama.com/',
    description:
      'Runs open AI models locally on your own machine from the command line or an API.',
    type: 'Tool',
    category: 'AI',
    tags: ['ai', 'local models', 'cli'],
    repository: 'https://github.com/ollama/ollama',
  },
];

/** Injection point for the catalog, so specs can provide fixtures. */
export const RESOURCE_CATALOG = new InjectionToken<readonly Resource[]>(
  'RESOURCE_CATALOG',
  { providedIn: 'root', factory: () => resources }
);
