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
  subtitle:
    'Ingeniero de sistemas / creador digital / desarrollador frontend / escritor de Colombia',
  description:
    'Fullstack developer con más de 2 años de experiencia en Angular, NestJS y bases de datos SQL. Lideré la migración de un sistema a una arquitectura desacoplada, logrando una mejora del 50% en rendimiento y escalabilidad. Apasionado por la innovación y el desarrollo ágil.',
};

// Experiencia profesional
export const experienceItems: ExperienceItem[] = [
  {
    icon: './icons/Man Technologist Medium Skin Tone.png',
    text: 'Actualmente trabajando como programador freelance',
  },
  {
    icon: './icons/Man Teacher Medium Skin Tone.png',
    text: 'Actualmente aprendiendo',
    link: {
      text: 'Godot',
      url: 'https://godotengine.org/',
    },
  },
  {
    icon: './icons/Beaming Face with Smiling Eyes.png',
    text: 'Todos mis proyectos están disponibles en',
    link: {
      text: 'GitHub',
      url: 'https://github.com/MrNizzy',
    },
  },
  {
    icon: './icons/Hundred Points.png',
    text: 'Cómo contactarme:',
    link: {
      text: 'mr.nizzy@proton.me',
      url: 'mailto:mr.nizzy@proton.me',
    },
  },
  {
    icon: './icons/Face with Monocle.png',
    text: 'Conoce sobre mi experiencia en',
    link: {
      text: 'LinkedIn',
      url: 'https://www.linkedin.com/in/mrnizzy/',
    },
  },
  {
    icon: './icons/Smiling Face with Heart-Eyes.png',
    text: 'Dato curioso: Me encanta escribir, ver anime y jugar videojuegos',
  },
  {
    icon: './icons/Nerd Face.png',
    text: 'Tengo un',
    link: {
      text: 'canal de YouTube',
      url: 'https://www.youtube.com/@MrNizzy',
    },
  },
];

// Experiencia laboral
export const workExperiences: WorkExperience[] = [
  {
    position: 'Freelance Developer - Ionic (Angular) / NestJS',
    company: 'Independiente',
    period: 'Agosto 2024 — Actualidad',
    description:
      'Fullstack y desarrollo móvil. Creador de la aplicación móvil Caffy: Un mundo mágico, en Ionic para dispositivos Android. Uso de patrones de arquitectura para mejorar el rendimiento, tráfico de red y seguridad de la información de las sesiones. Diseño y adaptación del sistema gráfico de la aplicación, logos, temas, UI/UX.',
  },
  {
    position: 'Desarrollador Fullstack',
    company: 'WEBCLOSTER S.A.S., Tuluá, Valle del Cauca',
    period: 'Marzo 2023 — Agosto 2024',
    description:
      'Migré el sistema de Invessoft a una arquitectura desacoplada, optimizando en un 50% la velocidad de carga de la aplicación, mediante el uso de Angular y NestJs, mejorando la calidad del software más de un 40%, cumpliendo con estándares de calidad, escalabilidad y rendimiento. Configuré el servidor VPS para el despliegue del sistema, incluyendo dominio, subdominios, Nginx, PM2, entre otros. Lideré el equipo de desarrollo Frontend, mejorando aspectos de UI/UX en más de un 40%. Contribuí a la mejora de un 30% de la base de datos para la migración de MySQL a PostgreSQL, incluyendo normalización y diagramas de flujo. Mejoré el sistema de permisos y perfiles en un 60%, incrementando la escalabilidad para nuevas funcionalidades grandes y pequeñas. Reduje la deuda técnica del aplicativo en más de un 65%, facilitando la lectura del código para futuros desarrolladores y promoviendo un ambiente de desarrollo más limpio y reutilizable. Desarrollé una API para la generación de certificados para usuarios participantes en eventos de investigación.',
  },
  {
    position: 'Desarrollador Freelance',
    company: 'Lt-Automation',
    period: 'Abril 2020 — Junio 2020',
    description:
      'Desarrollé una nueva landing page, mejorando un 80% los problemas de accesibilidad y experiencia de usuario de acuerdo a las especificaciones del cliente. Implementé propiedades más recientes de HTML5 y CSS3, modificando partes del sitio web deprecadas en cerca de un 35% de sus elementos visuales. Mejoré el diseño responsivo porque no se contaba con adaptación a dispositivos móviles, con soporte en smartphones, tablets y equipos de escritorio.',
  },
];

// Enlaces a redes sociales
export const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/mrnizzy',
    icon: './icons/linkedin.svg',
  },
  {
    name: 'Canal de YouTube',
    url: 'https://www.youtube.com/@MrNizzy',
    icon: './icons/youtube.svg',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/mr.nizzy',
    icon: './icons/instagram.svg',
  },
  {
    name: 'Canal de YouTube 2',
    url: 'https://www.youtube.com/channel/UCyGeNSYTlHkZPCx08vtozVg',
    icon: './icons/youtube.svg',
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
      name: 'Tailwindcss',
      icon: './icons/tailwindcss.svg',
      url: 'https://tailwindcss.com/',
    },
    {
      name: 'Bootstrap',
      icon: './icons/bootstrap.svg',
      url: 'https://getbootstrap.com',
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
  ],
  [
    {
      name: 'Python',
      icon: './icons/python.svg',
      url: 'https://www.python.org',
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
  ],
];

// Proyectos
export const projects: Project[] = [
  {
    title: 'Invessoft',
    images: ['./screenshots/invessoft.png', './screenshots/invessoft_2.png'],
    icon: 'https://invessoft.app/assets/logo/LogoIconBlue.svg',
    description:
      'Migré el sistema de Invessoft a una arquitectura desacoplada, optimizando en un 50% la velocidad de carga, mejorando la calidad del software y liderando mejoras en UI/UX y base de datos.',
    links: [
      {
        text: 'Ir al sitio web',
        url: 'https://invessoft.app/',
      },
    ],
  },
  {
    title: 'Promediar',
    images: ['./screenshots/promediar.png'],
    description:
      'Aplicación web para calcular promedios ponderados y determinar notas necesarias, creada con Angular y formularios reactivos.',
    links: [
      {
        text: 'Ir al sitio web',
        url: 'https://promediar.netlify.app/',
      },
      {
        text: 'Ir al repositorio',
        url: 'https://github.com/MrNizzy/promediar-angular',
      },
    ],
  },
  {
    title: 'NShorts',
    images: ['./screenshots/nshorts.png'],
    description:
      'Aplicación para acortar URLs utilizando Cloudflare Workers y base de datos D1.',
    links: [
      {
        text: 'Ir a la API (vista previa de URLs)',
        url: 'https://shorts.mrnizzy.me/api/short',
      },
    ],
  },
  {
    title: 'Ninja Frog',
    images: ['./screenshots/ninja_frog.png'],
    description:
      'Juego creado en Python con Pygame para practicar lógica y conceptos técnicos.',
    links: [
      {
        text: 'Ir al repositorio',
        url: 'https://github.com/MrNizzy/Ninja-Frog',
      },
    ],
  },
  {
    title: 'MiniZinc Converter',
    images: ['./screenshots/minizinc.png'],
    description:
      'Conversor de parámetros para problemas de optimización en MiniZinc, desarrollado como proyecto académico.',
    links: [
      {
        text: 'Ir al repositorio',
        url: 'https://github.com/MrNizzy/convertidor-minizinc',
      },
    ],
  },
  {
    title: 'TODO 16',
    images: ['./screenshots/todo-16.png'],
    description:
      'Prueba técnica con Angular 16 utilizando formularios reactivos para gestionar tareas.',
    links: [
      {
        text: 'Ir al sitio web',
        url: 'https://todo-16.netlify.app/',
      },
      {
        text: 'Ir al repositorio',
        url: 'https://github.com/MrNizzy/TODO-16.git',
      },
    ],
  },
  {
    title: 'Lenguaje-FLP (Pyscheme)',
    images: ['./screenshots/pyscheme.png'],
    description:
      'Lenguaje de programación interpretado básico creado con Scheme, soportando operaciones matemáticas, condicionales, bucles y estructuras de datos.',
    links: [
      {
        text: 'Ir al repositorio',
        url: 'https://github.com/MrNizzy/Lenguaje-FLP',
      },
    ],
  },
];
