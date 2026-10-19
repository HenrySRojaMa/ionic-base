import { Routes } from '@angular/router';
import { FormsPage } from './pages/forms-page/forms-page';
import { ShowcaseShell } from './showcase-shell/showcase-shell';

/** Documentación viva de la base. Se borra al iniciar un proyecto (con su ruta y su ítem de menú). */
export default [
  {
    path: '',
    component: ShowcaseShell,
    children: [
      { path: 'forms', component: FormsPage, title: 'Showcase · Formularios' },
      { path: '', pathMatch: 'full', redirectTo: 'forms' },
    ],
  },
] satisfies Routes;
