import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { AUTH_PATHS } from '../../auth/auth-paths';
import { SessionService } from '../../auth/session.service';
import { SKIP_AUTH } from '../http-context.tokens';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const refreshUrl = environment.apiUrl + environment.auth.refreshUrl;
  const user = { id: 1, displayName: 'Ana' };
  const unauthorized = { status: 401, statusText: 'Unauthorized' };
  const router = { navigate: vi.fn().mockResolvedValue(true), url: '/private' };
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    router.navigate.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => backend.verify());

  /** Deja correr las promesas pendientes (lectura del refresh token guardado). */
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  it('adds the bearer token when there is a session', () => {
    session.start({ accessToken: 'abc', user });

    http.get('/data').subscribe();

    expect(backend.expectOne('/data').request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('sends the request untouched without a session', () => {
    http.get('/data').subscribe();

    expect(backend.expectOne('/data').request.headers.has('Authorization')).toBe(false);
  });

  it('respects SKIP_AUTH', () => {
    session.start({ accessToken: 'abc', user });

    http.get('/public', { context: new HttpContext().set(SKIP_AUTH, true) }).subscribe();

    expect(backend.expectOne('/public').request.headers.has('Authorization')).toBe(false);
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    session.start({ accessToken: 'old', user });
    let result: unknown;

    http.get('/data').subscribe((body) => (result = body));
    backend.expectOne('/data').flush(null, unauthorized);

    await settle(); // AuthApi.refresh() lee primero el almacenamiento (asíncrono)
    const refresh = backend.expectOne(refreshUrl);
    expect(refresh.request.withCredentials).toBe(true);
    refresh.flush({ code: 'OK', message: '', data: { accessToken: 'new', user } });
    await settle();

    const retry = backend.expectOne('/data');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new');
    retry.flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(session.accessToken()).toBe('new');
  });

  it('shares a single refresh between concurrent 401 responses', async () => {
    session.start({ accessToken: 'old', user });

    for (const url of ['/a', '/b', '/c']) http.get(url).subscribe();
    for (const url of ['/a', '/b', '/c']) backend.expectOne(url).flush(null, unauthorized);

    await settle();
    // Una sola llamada de refresh para las tres peticiones.
    backend
      .expectOne(refreshUrl)
      .flush({ code: 'OK', message: '', data: { accessToken: 'new', user } });
    await settle();

    for (const url of ['/a', '/b', '/c']) {
      expect(backend.expectOne(url).request.headers.get('Authorization')).toBe('Bearer new');
    }
  });

  it('ends the session and redirects to login when the refresh fails', async () => {
    session.start({ accessToken: 'old', user });
    let failed = false;

    http.get('/data').subscribe({ error: () => (failed = true) });
    backend.expectOne('/data').flush(null, unauthorized);
    await settle();
    backend.expectOne(refreshUrl).flush(null, unauthorized);
    await settle();

    expect(failed).toBe(true);
    expect(session.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith([AUTH_PATHS.login], {
      queryParams: { returnUrl: '/private' },
    });
  });
});
