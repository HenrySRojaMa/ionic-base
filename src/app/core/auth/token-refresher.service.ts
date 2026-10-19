import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, tap, throwError } from 'rxjs';
import { AuthApi } from './auth.api';
import { AUTH_PATHS } from './auth-paths';
import { SessionService } from './session.service';

/**
 * Cola de refresh del token.
 *
 * Si varias peticiones fallan con 401 al mismo tiempo, todas reciben el MISMO
 * refresh en curso (compartido con shareReplay) en lugar de lanzar uno cada una.
 *
 * Vive en un servicio porque un interceptor funcional es solo una función: no
 * tiene instancia donde guardar el refresh en curso.
 */
@Service()
export class TokenRefresher {
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  private inFlight$: Observable<string> | null = null;

  /** Devuelve el token nuevo; si el refresh falla, cierra la sesión y lleva al login. */
  refresh(): Observable<string> {
    if (!this.inFlight$) {
      this.inFlight$ = this.authApi.refresh().pipe(
        tap((session) => this.session.start(session)),
        map((session) => session.accessToken),
        catchError((error: unknown) => {
          this.expireSession();
          return throwError(() => error);
        }),
        finalize(() => (this.inFlight$ = null)),
        shareReplay(1),
      );
    }
    return this.inFlight$;
  }

  private expireSession(): void {
    this.session.clear();
    void this.router.navigate([AUTH_PATHS.login], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}
