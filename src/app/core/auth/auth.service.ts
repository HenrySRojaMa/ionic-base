import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, tap, timeout } from 'rxjs';
import { AuthApi } from './auth.api';
import { AUTH_PATHS } from './auth-paths';
import { LoginCredentials, Session } from './auth.models';
import { SessionService } from './session.service';

/** Tiempo máximo que la app espera a recuperar la sesión antes de arrancar. */
const SESSION_RESTORE_TIMEOUT_MS = 5000;

/** Orquesta los casos de uso de autenticación: API + estado + navegación. */
@Service()
export class AuthService {
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  login(credentials: LoginCredentials): Observable<Session> {
    return this.authApi.login(credentials).pipe(tap((session) => this.session.start(session)));
  }

  /**
   * Recupera la sesión al arrancar la app usando el refresh token (cookie HttpOnly).
   * Nunca falla: sin sesión, con el servidor caído o si tarda demasiado, la app
   * arranca como usuario anónimo.
   */
  restoreSession(): Observable<boolean> {
    return this.authApi.refresh().pipe(
      timeout(SESSION_RESTORE_TIMEOUT_MS),
      tap((session) => this.session.start(session)),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  /** Cierra la sesión local aunque el servidor falle: el usuario pidió salir. */
  logout(): void {
    this.authApi
      .logout()
      .pipe(
        catchError(() => of(undefined)),
        finalize(() => {
          this.session.clear();
          void this.router.navigateByUrl(AUTH_PATHS.afterLogout);
        }),
      )
      .subscribe();
  }
}
