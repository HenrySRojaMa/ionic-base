import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';

/** El routing raíz SOLO carga features de forma diferida: nunca importa páginas. */
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'showcase',
        loadChildren: () => import('./features/showcase/showcase.routes'),
      },
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./features/home/home.routes'),
      },
    ],
  },
  {
    // Fuera del layout principal: la página de login no tiene menú lateral.
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  { path: '**', redirectTo: '' },
];
