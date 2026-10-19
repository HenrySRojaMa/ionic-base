import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { PlatformService } from '../platform/platform.service';
import { StorageService } from '../platform/storage.service';
import { AuthApi } from './auth.api';
import { Session } from './auth.models';

describe('AuthApi', () => {
  const url = (path: string) => environment.apiUrl + path;
  const user = { id: 1, displayName: 'Ana' };

  function setup(isNative: boolean) {
    const store = new Map<string, string>();
    const storage = {
      get: async (key: string) => store.get(key) ?? null,
      set: async (key: string, value: string) => void store.set(key, value),
      remove: async (key: string) => void store.delete(key),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: PlatformService,
          useValue: { isNative, platform: isNative ? 'android' : 'web' },
        },
        { provide: StorageService, useValue: storage },
      ],
    });
    return { api: TestBed.inject(AuthApi), http: TestBed.inject(HttpTestingController), store };
  }

  /** Deja correr las promesas del almacenamiento antes de mirar las peticiones. */
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  it('native: keeps the refresh token out of the session and sends it when refreshing', async () => {
    const { api, http, store } = setup(true);
    let session: Session | undefined;

    api.login({ username: 'demo', password: 'x' }).subscribe((s) => (session = s));
    const login = http.expectOne(url(environment.auth.loginUrl));
    expect(login.request.body).toEqual({ username: 'demo', password: 'x', client: 'native' });
    login.flush({ code: 'OK', message: '', data: { accessToken: 'a1', user, refreshToken: 'r1' } });
    await settle();

    expect(session).toEqual({ accessToken: 'a1', user }); // sin refreshToken
    expect(store.get('auth.refresh-token')).toBe('r1');

    api.refresh().subscribe();
    await settle();
    expect(http.expectOne(url(environment.auth.refreshUrl)).request.body).toEqual({
      client: 'native',
      refreshToken: 'r1',
    });
  });

  it('web: relies on the HttpOnly cookie and stores nothing', async () => {
    const { api, http, store } = setup(false);

    api.refresh().subscribe();
    await settle();
    const refresh = http.expectOne(url(environment.auth.refreshUrl));
    expect(refresh.request.withCredentials).toBe(true);
    expect(refresh.request.body).toEqual({ client: 'web', refreshToken: undefined });
    refresh.flush({ code: 'OK', message: '', data: { accessToken: 'a2', user } });
    await settle();

    expect(store.size).toBe(0);
  });

  it('native: logout clears the stored refresh token', async () => {
    const { api, http, store } = setup(true);
    store.set('auth.refresh-token', 'r1');

    api.logout().subscribe();
    await settle();
    http.expectOne(url(environment.auth.logoutUrl)).flush({ code: 'OK', message: '', data: null });
    await settle();

    expect(store.size).toBe(0);
  });
});
