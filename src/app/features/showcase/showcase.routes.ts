import { Routes } from '@angular/router';
import { CascadePage } from './pages/cascade-page/cascade-page';
import { DialogsPage } from './pages/dialogs-page/dialogs-page';
import { FormsPage } from './pages/forms-page/forms-page';
import { TablePage } from './pages/table-page/table-page';
import { ThemePage } from './pages/theme-page/theme-page';
import { ShowcaseShell } from './showcase-shell/showcase-shell';

/** Documentación viva de la base. Se borra al iniciar un proyecto (con su ruta y su ítem de menú). */
export default [
  {
    path: '',
    component: ShowcaseShell,
    children: [
      { path: 'forms', component: FormsPage, title: 'Showcase · Formularios' },
      { path: 'cascade', component: CascadePage, title: 'Showcase · Cascada' },
      { path: 'table', component: TablePage, title: 'Showcase · Tabla' },
      { path: 'dialogs', component: DialogsPage, title: 'Showcase · Diálogos y HTTP' },
      { path: 'theme', component: ThemePage, title: 'Showcase · Tema' },
      { path: '', pathMatch: 'full', redirectTo: 'forms' },
    ],
  },
] satisfies Routes;
