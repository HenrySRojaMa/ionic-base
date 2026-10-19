import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, dematerialize, materialize, of, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ClientKind, LoginCredentials, Session } from '../auth/auth.models';
import { ApiResponse } from '../models/api-response.model';
import { MOCK_PLACES, MOCK_USERS } from './mock-data';

/** Latencia simulada para ver spinners y estados de carga. */
export const MOCK_LATENCY_MS = 400;
/** Vida corta del token simulado, para poder ver el refresh en acción. */
export const MOCK_TOKEN_TTL_MS = 60_000;
/** Simula la cookie HttpOnly del refresh token (sobrevive a recargas de la pestaña). */
const REFRESH_KEY = 'mock.refresh-user';

type Handler = (request: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

/**
 * Backend simulado (solo con environment.mockApi = true). Mismas rutas y
 * comportamiento que en las bases web; usuario de prueba demo / demo123.
 *
 * Además simula el contrato nativo: con client = 'native' el refresh token
 * viaja en el cuerpo (login lo entrega, refresh lo recibe y lo rota). Con
 * 'web' se usa sessionStorage como si fuera la cookie HttpOnly.
 *
 * Como interceptor funcional va al final de withInterceptors([...]): el resto de
 * interceptores funciona igual que contra el servidor real.
 */
export const mockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl)) return next(request);

  const path = request.url.substring(environment.apiUrl.length).split('?')[0];
  const handler = ROUTES[`${request.method} ${path}`];
  const response$ = handler ? handler(request) : fail(404, `Ruta simulada no encontrada: ${path}`);

  // materialize/dematerialize: aplica la latencia también a los errores.
  return response$.pipe(materialize(), delay(MOCK_LATENCY_MS), dematerialize());
};

const ROUTES: Record<string, Handler> = {
  [`POST ${environment.auth.loginUrl}`]: login,
  [`POST ${environment.auth.refreshUrl}`]: refresh,
  [`POST ${environment.auth.logoutUrl}`]: logout,
  'GET demo/protected': protectedData,
  'GET demo/success': () => ok(null, 'La operación se realizó correctamente.'),
  'GET demo/error': () => fail(400, 'El dato enviado no es válido (error simulado).'),
  'GET demo/conflict': () => fail(409, 'Ya existe un registro con ese código.'),
  'GET demo/server-error': () => fail(500),
  'GET demo/places': () => ok(MOCK_PLACES),
};

/** Cuerpo de login/refresh/logout: client indica cómo se entrega el refresh token. */
interface AuthBody extends Partial<LoginCredentials> {
  client?: ClientKind;
  refreshToken?: string;
}

function login(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { username, password, client } = request.body as AuthBody;
  const user = MOCK_USERS.find((u) => u.username === username && u.password === password);
  if (!user) return fail(400, 'Usuario o contraseña incorrectos.');

  if (client === 'native') {
    // Nativo: el refresh token viaja en el cuerpo y la app lo guarda (Preferences).
    return ok({ ...createSession(user.id), refreshToken: `mock-refresh.${user.id}` });
  }
  sessionStorage.setItem(REFRESH_KEY, String(user.id)); // web: "cookie"
  return ok(createSession(user.id));
}

function refresh(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const { client, refreshToken } = (request.body ?? {}) as AuthBody;
  const userId =
    client === 'native'
      ? Number(refreshToken?.replace('mock-refresh.', '') ?? 0)
      : Number(sessionStorage.getItem(REFRESH_KEY));
  if (!userId) return fail(401, 'Sesión no encontrada.');

  return client === 'native'
    ? ok({ ...createSession(userId), refreshToken: `mock-refresh.${userId}` }) // rotación
    : ok(createSession(userId));
}

function logout(): Observable<HttpEvent<unknown>> {
  sessionStorage.removeItem(REFRESH_KEY);
  return ok(null);
}

function protectedData(request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  if (!isValidToken(token)) return fail(401, 'Token inválido o expirado.');
  return ok({ serverTime: new Date().toISOString() }, 'Datos protegidos obtenidos.');
}

function createSession(userId: number): Session {
  const user = MOCK_USERS.find((u) => u.id === userId) ?? MOCK_USERS[0];
  const expiresAt = Date.now() + MOCK_TOKEN_TTL_MS;
  return {
    accessToken: `mock.${user.id}.${expiresAt}`,
    user: { id: user.id, displayName: user.displayName },
  };
}

function isValidToken(token: string): boolean {
  const [prefix, , expiresAt] = token.split('.');
  return prefix === 'mock' && Number(expiresAt) > Date.now();
}

function ok<T>(data: T, message = ''): Observable<HttpEvent<ApiResponse<T>>> {
  return of(new HttpResponse({ status: 200, body: { code: 'OK', message, data } }));
}

function fail(status: number, message?: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: 'Mock error',
        error: message ? { code: String(status), message } : null,
      }),
  );
}
