import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlSegment, UrlTree } from '@angular/router';
import { AUTH_PATHS } from './auth-paths';
import { SessionService } from './session.service';

/**
 * Guards funcionales: igual que en la base legacy (que ya los usaba). Lo único
 * que cambia es que la sesión se lee de un signal: isAuthenticated().
 *
 * Devuelven un UrlTree para redirigir en un solo paso.
 */

/** Solo usuarios autenticados. Guarda la URL pedida en ?returnUrl=. */
export const authGuard: CanActivateFn = (_route, state) => requireSession(state.url);

/**
 * Para rutas con loadChildren: si no hay sesión, el código lazy ni siquiera
 * se descarga (canActivate lo descargaría primero).
 */
export const authMatchGuard: CanMatchFn = (_route, segments: UrlSegment[]) =>
  requireSession('/' + segments.map((segment) => segment.path).join('/'));

/** Solo usuarios SIN sesión (por ejemplo, la página de login). */
export const guestGuard: CanActivateFn = () =>
  inject(SessionService).isAuthenticated()
    ? inject(Router).createUrlTree([AUTH_PATHS.afterLogin])
    : true;

function requireSession(returnUrl: string): true | UrlTree {
  return inject(SessionService).isAuthenticated()
    ? true
    : inject(Router).createUrlTree([AUTH_PATHS.login], { queryParams: { returnUrl } });
}
