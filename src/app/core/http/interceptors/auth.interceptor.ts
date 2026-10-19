import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { SessionService } from '../../auth/session.service';
import { TokenRefresher } from '../../auth/token-refresher.service';
import { SKIP_AUTH } from '../http-context.tokens';

/**
 * 1. Agrega el header Authorization a todas las peticiones (salvo SKIP_AUTH).
 * 2. Si la API responde 401, refresca el token UNA sola vez (TokenRefresher
 *    comparte el refresh en curso) y reintenta la petición.
 *
 * Interceptor FUNCIONAL: inject() se llama al inicio, de forma síncrona,
 * dentro del contexto de inyección que Angular le da a la función.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionService);
  const refresher = inject(TokenRefresher);

  const token = session.accessToken();
  if (request.context.get(SKIP_AUTH) || !token) {
    return next(request);
  }

  return next(withToken(request, token)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== HttpStatusCode.Unauthorized) {
        return throwError(() => error);
      }

      // Otra petición ya refrescó el token mientras esta viajaba: reintentar sin refrescar.
      const current = session.accessToken();
      if (current && current !== token) {
        return next(withToken(request, current));
      }

      // El reintento no vuelve a pasar por este catchError: no hay bucles infinitos.
      return refresher.refresh().pipe(switchMap((newToken) => next(withToken(request, newToken))));
    }),
  );
};

export function withToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
