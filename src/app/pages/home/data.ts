export interface ProfileInfo {
  title: string;
  subtitle: string;
  description: string;
}

export interface ExperienceItem {
  icon: string;
  text: string;
  link?: {
    text: string;
    url: string;
  };
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface Tool {
  name: string;
  icon: string;
  url: string;
}

export interface Project {
  title: string;
  images: string[];
  icon?: string;
  description?: string;
  details?: string[];
  // optional metadata for filtering and chips
  categories?: string[]; // e.g., ['Web', 'Mobile', 'Game', 'Tool', 'Academic', 'Open Source', 'Company']
  tags?: string[]; // e.g., tech or highlights
  links: {
    text: string;
    url: string;
  }[];
}

export interface WorkExperience {
  position: string;
  company: string;
  period: string;
  description: string;
  readMoreLink?: string;
}

// Información del perfil
export const profileInfo: ProfileInfo = {
  title: 'Hola 👋, Soy MrNizzy',
  subtitle: 'Ingeniero de sistemas / creador digital / escritor de Colombia',
  description:
    'Desarrollador con 3 años de experiencia en Angular, NestJS y bases de datos SQL. Lideré la migración de sistemas a arquitecturas desacopladas, mejorando rendimiento y escalabilidad en un 50%. Experto en diseño responsivo, optimización de procesos y desarrollo ágil.',
};

// Experiencia profesional
export const experienceItems: ExperienceItem[] = [
  {
    icon: './icons/Man Technologist Medium Skin Tone.png',
    text: 'Currently working full-time as a developer',
  },
  {
    icon: './icons/Man Teacher Medium Skin Tone.png',
    text: 'Currently learning',
    link: {
      text: 'Ionic',
      url: 'https://ionicframework.com',
    },
  },
  {
    icon: './icons/Beaming Face with Smiling Eyes.png',
    text: 'Love innovation in technology',
  },
  {
    icon: './icons/Hundred Points.png',
    text: 'Use electronic devices since I was a child',
  },
  {
    icon: './icons/Face with Monocle.png',
    text: 'This web is built with ❤️',
    link: {
      text: 'Angular',
      url: 'https://angular.dev',
    },
  },
  {
    icon: './icons/Smiling Face with Heart-Eyes.png',
    text: 'I like to write, watch anime and play video games',
  },
  {
    icon: './icons/Nerd Face.png',
    text: 'I have a',
    link: {
      text: 'YouTube Channel',
      url: 'https://www.youtube.com/@MrNizzy',
    },
  },
  {
    icon: './icons/Smiling Face with Heart-Eyes.png',
    text: 'Love the science and cats 😺',
  },
];

// Enlaces a redes sociales
export const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/MrNizzy',
    icon: './icons/github.svg',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/mrnizzy',
    icon: './icons/linkedin.svg',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@MrNizzy',
    icon: './icons/youtube.svg',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/mr.nizzy',
    icon: './icons/instagram.svg',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCyGeNSYTlHkZPCx08vtozVg',
    icon: './icons/youtube.svg',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/mrnizzy',
    icon: './icons/telegram.svg',
  },
];

// Herramientas y lenguajes
export const tools: Tool[][] = [
  [
    {
      name: 'Angular',
      icon: './icons/angular.svg',
      url: 'https://angular.io/cli',
    },
    {
      name: 'Nestjs',
      icon: './icons/nestjs.svg',
      url: 'https://nestjs.com/',
    },
    {
      name: 'HTML5',
      icon: './icons/html5.svg',
      url: 'https://developer.mozilla.org/es/docs/Web/HTML',
    },
    {
      name: 'CSS3',
      icon: './icons/css.svg',
      url: 'https://developer.mozilla.org/es/docs/Learn/Getting_started_with_the_web/CSS_basics',
    },
    {
      name: 'JavaScript',
      icon: './icons/javascript.svg',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    },
    {
      name: 'TypeScript',
      icon: './icons/typescript.svg',
      url: 'https://www.typescriptlang.org/',
    },
    {
      name: 'Sass',
      icon: './icons/sass.svg',
      url: 'https://sass-lang.com',
    },
    {
      name: 'Node.js',
      icon: './icons/nodejs.svg',
      url: 'https://nodejs.org',
    },
    {
      name: 'Figma',
      icon: './icons/figma.svg',
      url: 'https://www.figma.com/',
    },
    {
      name: 'Git',
      icon: './icons/git.svg',
      url: 'https://git-scm.com/',
    },
    {
      name: 'Linux',
      icon: './icons/linux.svg',
      url: 'https://www.linux.org/',
    },
    {
      name: 'MySQL',
      icon: './icons/mysql.svg',
      url: 'https://www.mysql.com/',
    },
    {
      name: 'PostgreSQL',
      icon: './icons/postgresql.svg',
      url: 'https://www.postgresql.org',
    },
    {
      name: 'Ionic',
      icon: './icons/ionic.svg',
      url: 'https://ionicframework.com',
    },
    {
      name: 'Cloudflare',
      icon: './icons/cloudflare.svg',
      url: 'https://www.cloudflare.com',
    },
    {
      name: 'Cloudflare Workers',
      icon: './icons/cloudflare-workers.svg',
      url: 'https://workers.cloudflare.com',
    },
    {
      name: 'Hono',
      icon: './icons/hono.svg',
      url: 'https://hono.dev',
    },
    {
      name: 'Angular Material',
      icon: './icons/angular.svg',
      url: 'https://material.angular.io',
    },
    {
      name: 'Python',
      icon: './icons/python.svg',
      url: 'https://www.python.org',
    },
    {
      name: 'LaTeX',
      icon: './icons/latex.svg',
      url: 'https://www.latex-project.org/',
    },
    {
      name: 'Tailwindcss',
      icon: './icons/tailwindcss.svg',
      url: 'https://tailwindcss.com/',
    },
    {
      name: 'daisyUI',
      icon: './icons/daisyui.svg',
      url: 'https://daisyui.com',
    },
    {
      name: 'Bootstrap',
      icon: './icons/bootstrap.svg',
      url: 'https://getbootstrap.com',
    },
  ],
];

// Proyectos
export const projects: Project[] = [
  {
    title: 'Caffy: A Magical World',
    images: ['./screenshots/caffy.jpg'],
    icon: './icons/caffy.png',
    categories: ['Mobile', 'Web'],
    tags: ['Ionic', 'Angular', 'NestJS'],
    description:
      'Android mobile app built with Ionic that showcases Colombia’s culture, gastronomy, landmarks, and more. Powered by Angular with a NestJS API, featuring a responsive, mobile‑first design and optimized performance.',
    links: [
      {
        text: 'Visit website',
        url: 'https://caffy.mrnizzy.me/',
      },
    ],
  },
  {
    title: 'Repos Trackr',
    images: ['./screenshots/repos-trackr.png'],
    icon: './icons/repos-trackr.png',
    categories: ['Web', 'Open Source'],
    tags: ['Angular', 'NestJS', 'GitHub API', 'Laravel Proxy'],
    description:
      'Web application to explore a user’s GitHub repositories, including stars, forks, and commit insights. Built with Angular and NestJS, integrating the GitHub API via a Laravel proxy. Originally developed as part of a technical assessment.',
    links: [
      {
        text: 'Visit website',
        url: 'https://repos-trackr.mrnizzy.me',
      },
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/repo-trackr-angular',
      },
    ],
  },
  {
    title: 'Invessoft',
    images: ['./screenshots/invessoft.png', './screenshots/invessoft_2.png'],
    icon: 'https://invessoft.app/assets/logo/LogoIconBlue.svg',
    categories: ['Company', 'Web'],
    tags: ['Architecture', 'Performance', 'UI/UX'],
    description:
      'Led the migration of Invessoft’s platform to a decoupled architecture, improving load times by ~50%, enhancing software quality, and driving key UI/UX and database optimizations.',
    links: [
      {
        text: 'Visit website',
        url: 'https://invessoft.app/',
      },
    ],
  },
  {
    title: 'Promediar',
    images: ['./screenshots/promediar.png'],
    icon: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Teacher%20Medium%20Skin%20Tone.png',
    categories: ['Web', 'Open Source'],
    tags: ['Angular', 'Reactive Forms'],
    description:
      'Web application for computing weighted averages and estimating required grades, built with Angular and reactive forms.',
    links: [
      {
        text: 'Visit website',
        url: 'https://promediar.netlify.app/',
      },
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/promediar-angular',
      },
    ],
  },
  {
    title: 'NShorts',
    images: ['./screenshots/nshorts.png'],
    categories: ['Web', 'Tool'],
    tags: ['Cloudflare Workers', 'D1', 'Hono'],
    description:
      'URL shortener powered by Cloudflare Workers with D1 as the data store, designed for low-latency edge execution.',
    links: [
      {
        text: 'Open API (URL preview)',
        url: 'https://shorts.mrnizzy.me/api/short',
      },
    ],
  },
  {
    title: 'Ninja Frog',
    images: ['./screenshots/ninja_frog.png'],
    categories: ['Game'],
    tags: ['Python', 'Pygame'],
    description:
      '2D platformer built in Python with Pygame to practice game logic and core programming concepts.',
    links: [
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/Ninja-Frog',
      },
    ],
  },
  {
    title: 'MiniZinc Converter',
    images: ['./screenshots/minizinc.png'],
    categories: ['Academic', 'Tool'],
    tags: ['MiniZinc', 'Optimization'],
    description:
      'Parameter converter for MiniZinc optimization problems, developed as an academic project.',
    links: [
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/convertidor-minizinc',
      },
    ],
  },
  {
    title: 'TODO 16',
    images: ['./screenshots/todo-16.png'],
    categories: ['Web', 'Open Source'],
    tags: ['Angular', 'Forms'],
    description:
      'Technical assessment built with Angular 16 that uses reactive forms to manage tasks with validation and state handling.',
    links: [
      {
        text: 'Visit website',
        url: 'https://todo-16.netlify.app/',
      },
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/TODO-16.git',
      },
    ],
  },
  {
    title: 'FLP Language (Pyscheme)',
    images: ['./screenshots/pyscheme.png'],
    categories: ['Academic', 'Open Source'],
    tags: ['Scheme', 'Interpreter', 'Language'],
    description:
      'Basic interpreted programming language built with Scheme, supporting math operations, conditionals, loops, and data structures.',
    links: [
      {
        text: 'View repository',
        url: 'https://github.com/MrNizzy/Lenguaje-FLP',
      },
    ],
  },
];
