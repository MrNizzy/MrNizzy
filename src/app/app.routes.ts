import { Routes } from '@angular/router';
import { environment } from '@env/environment';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/home/home.component').then((m) => m.HomeComponent),
    title: `Inicio - ${environment.appName}`,
  },
  {
    path: 'about',
    loadComponent: () =>
      import('@pages/about/about.component').then((m) => m.AboutComponent),
    title: `Acerca de - ${environment.appName}`,
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('@pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
    title: `Contacto - ${environment.appName}`,
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@pages/projects/projects.component').then(
        (m) => m.ProjectsComponent
      ),
    title: `Proyectos - ${environment.appName}`,
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('@pages/privacy/privacy.component').then(
        (m) => m.PrivacyComponent
      ),
    title: `Política de privacidad - ${environment.appName}`,
  },
  {
    path: '**',
    loadComponent: () =>
      import('@pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: `Página no encontrada - ${environment.appName}`,
  },
];
