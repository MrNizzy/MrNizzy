import { Routes } from '@angular/router';
import { environment } from '@env/environment';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@pages/home/home.component').then((m) => m.HomeComponent),
    title: `Inicio - ${environment.appName}`,
  },
];
