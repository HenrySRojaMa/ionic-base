import { Service, inject } from '@angular/core';
import { Observable, from, map, switchMap } from 'rxjs';
import { environment } from '@env/environment';
import { ApiService } from '../http/api.service';
import { ApiResponse } from '../models/api-response.model';
import { PlatformService } from '../platform/platform.service';
import { ClientKind, LoginCredentials, Session } from './auth.models';
import { RefreshTokenStore } from './refresh-token.store';

/**
 * Llamadas HTTP de autenticación, conscientes de la plataforma.
 *
 * Contrato con el backend (además de lo que ya hacían las bases web):
 * - Login, refresh y logout envían client: 'web' | 'native'.
 * - Para 'native' el backend devuelve refreshToken en el cuerpo y espera
 *   recibirlo en el cuerpo del refresh/logout.
 * - Para 'web' se sigue usando la cookie HttpOnly (withCredentials).
 *
 * Este archivo guarda/borra el refresh token y lo quita de la sesión: el resto
 * de la app (SessionService, interceptor, guards) es igual que en la web.
 */
@Service()
export class AuthApi {
  private readonly api = inject(ApiService);
  private readonly store = inject(RefreshTokenStore);
  private readonly client: ClientKind = inject(PlatformService).isNative ? 'native' : 'web';

  login(credentials: LoginCredentials): Observable<Session> {
    return this.api
      .post<ApiResponse<Session>>(environment.auth.loginUrl, {
        body: { ...credentials, client: this.client },
        skipAuth: true,
        withCredentials: true,
        error: true,
      })
      .pipe(switchMap((response) => this.keep(response.data)));
  }

  refresh(): Observable<Session> {
    return from(this.store.read()).pipe(
      switchMap((refreshToken) =>
        this.api.post<ApiResponse<Session>>(environment.auth.refreshUrl, {
          body: { client: this.client, refreshToken: refreshToken ?? undefined },
          skipAuth: true,
          withCredentials: true,
        }),
      ),
      switchMap((response) => this.keep(response.data)),
    );
  }

  logout(): Observable<void> {
    return from(this.store.read()).pipe(
      switchMap((refreshToken) =>
        this.api.post<ApiResponse<null>>(environment.auth.logoutUrl, {
          body: { client: this.client, refreshToken: refreshToken ?? undefined },
          skipAuth: true,
          withCredentials: true,
        }),
      ),
      switchMap(() => from(this.store.clear())),
      map(() => undefined),
    );
  }

  /** Guarda el refresh token (solo nativo) y lo quita de la sesión que se entrega. */
  private keep(session: Session): Observable<Session> {
    const { refreshToken, ...rest } = session;
    return from(this.store.save(refreshToken)).pipe(map(() => rest));
  }
}
