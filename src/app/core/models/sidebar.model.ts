/*
This model is used to define the sidebar menu items. It is used in the sidebar component to display the menu items.
*/

export interface SimpleMenuItem {
  title: string;
  section: string;
}

export const sidebar: SimpleMenuItem[] = [
  {
    title: 'Inicio',
    section: '#',
  },
  {
    title: 'Works',
    section: '#',
  },
  {
    title: 'Languages and tools',
    section: '#',
  },
  {
    title: 'Projects',
    section: '#',
  },
  {
    title: 'Achievements',
    section: '#',
  },
  {
    title: 'Contact',
    section: '#',
  },
];
