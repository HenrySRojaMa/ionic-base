import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/auth.guards';
import { LoginPage } from './pages/login-page/login-page';

export default [
  { path: 'login', component: LoginPage, canActivate: [guestGuard], title: 'Iniciar sesión' },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
] satisfies Routes;
