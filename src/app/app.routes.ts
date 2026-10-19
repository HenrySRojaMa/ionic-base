import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';

/** El routing raíz SOLO carga features de forma diferida: nunca importa páginas. */
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () => import('./features/home/home.routes'),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
