import { Service, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { AuthApi } from './auth.api';
import { AUTH_PATHS } from './auth-paths';
import { LoginCredentials, Session } from './auth.models';
import { SessionService } from './session.service';

/** Orquesta los casos de uso de autenticación: API + estado + navegación. */
@Service()
export class AuthService {
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  login(credentials: LoginCredentials): Observable<Session> {
    return this.authApi.login(credentials).pipe(tap((session) => this.session.start(session)));
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
