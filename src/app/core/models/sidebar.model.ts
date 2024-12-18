/*
This model is used to define the sidebar menu items. It is used in the sidebar component to display the menu items.
*/

export interface SimpleMenuItem {
  title: string;
  section: string;
  icon: string;
}

export const sidebar: SimpleMenuItem[] = [
  {
    title: 'Works',
    section: '#works',
    icon: 'work',
  },
  {
    title: 'Languages and tools',
    section: '#languages',
    icon: 'code',
  },
  {
    title: 'Projects',
    section: '#projects',
    icon: 'folder',
  },
  {
    title: 'Achievements',
    section: '#achievements',
    icon: 'star',
  },
  {
    title: 'Contact',
    section: '#contact',
    icon: 'email',
  },
];
