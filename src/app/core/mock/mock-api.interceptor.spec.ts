import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { MOCK_LATENCY_MS, mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
  const api = environment.apiUrl;
  let http: HttpClient;

  beforeEach(() => {
    vi.useFakeTimers(); // la latencia simulada usa setTimeout (operador delay)
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  /** Ejecuta una petición contra el mock y devuelve la respuesta o el estado del error. */
  function call(method: 'GET' | 'POST', path: string, body?: unknown): unknown {
    let result: unknown;
    http.request(method, api + path, { body }).subscribe({
      next: (response) => (result = response),
      error: (error) => (result = error.status),
    });
    vi.advanceTimersByTime(MOCK_LATENCY_MS);
    return result;
  }

  const demo = { username: 'demo', password: 'demo123' };

  it('logs in the demo user and then allows a refresh', () => {
    expect(call('POST', environment.auth.loginUrl, demo)).toEqual(
      expect.objectContaining({ code: 'OK' }),
    );

    const refresh = call('POST', environment.auth.refreshUrl) as { data: { accessToken: string } };
    expect(refresh.data.accessToken).toMatch(/^mock\./);
  });

  it('rejects wrong credentials with a 400', () => {
    expect(call('POST', environment.auth.loginUrl, { username: 'demo', password: 'x' })).toBe(400);
  });

  it('answers 401 to refresh without a session and after logout', () => {
    expect(call('POST', environment.auth.refreshUrl)).toBe(401);

    call('POST', environment.auth.loginUrl, demo);
    call('POST', environment.auth.logoutUrl);
    expect(call('POST', environment.auth.refreshUrl)).toBe(401);
  });

  it('hands the refresh token in the body to native clients and rotates it', () => {
    const login = call('POST', environment.auth.loginUrl, { ...demo, client: 'native' }) as {
      data: { refreshToken: string };
    };
    expect(login.data.refreshToken).toBe('mock-refresh.1');
    expect(sessionStorage.length).toBe(0); // en nativo no hay "cookie"

    const refresh = call('POST', environment.auth.refreshUrl, {
      client: 'native',
      refreshToken: login.data.refreshToken,
    }) as { data: { accessToken: string; refreshToken: string } };
    expect(refresh.data.accessToken).toMatch(/^mock\./);
    expect(refresh.data.refreshToken).toBe('mock-refresh.1');
  });

  it('answers 401 to a native refresh without token', () => {
    expect(call('POST', environment.auth.refreshUrl, { client: 'native' })).toBe(401);
  });

  it('returns 404 for unknown API routes', () => {
    expect(call('GET', 'does/not/exist')).toBe(404);
  });
});
