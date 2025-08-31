import { Routes } from '@angular/router';
import { environment } from '@env/environment';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/home/home.component').then((m) => m.HomeComponent),
    title: `Home - ${environment.appName}`,
  },
  {
    path: 'about',
    loadComponent: () =>
      import('@pages/about/about.component').then((m) => m.AboutComponent),
    title: `About - ${environment.appName}`,
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('@pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
    title: `Contact - ${environment.appName}`,
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@pages/projects/projects.component').then(
        (m) => m.ProjectsComponent
      ),
    title: `Projects - ${environment.appName}`,
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('@pages/resources/resources.component').then(
        (m) => m.ResourcesComponent
      ),
    title: `Resources - ${environment.appName}`,
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('@pages/privacy/privacy.component').then(
        (m) => m.PrivacyComponent
      ),
    title: `Privacy - ${environment.appName}`,
  },
  {
    path: '**',
    loadComponent: () =>
      import('@pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: `Not Found - ${environment.appName}`,
  },
];
