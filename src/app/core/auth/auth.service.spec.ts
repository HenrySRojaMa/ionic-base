import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthApi } from './auth.api';
import { AUTH_PATHS } from './auth-paths';
import { Session } from './auth.models';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  const session: Session = { accessToken: 'token-1', user: { id: 1, displayName: 'Ana' } };
  const authApi = { login: vi.fn(), logout: vi.fn(), refresh: vi.fn() };
  const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
  let sessionService: SessionService;
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useValue: authApi },
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
  });

  it('starts the session after a successful login', () => {
    authApi.login.mockReturnValue(of(session));

    service.login({ username: 'ana', password: 'x' }).subscribe();

    expect(sessionService.session()).toEqual(session);
  });

  it('clears the session and navigates even if the server logout fails', () => {
    sessionService.start(session);
    authApi.logout.mockReturnValue(throwError(() => new Error('offline')));

    service.logout();

    expect(sessionService.isAuthenticated()).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith(AUTH_PATHS.afterLogout);
  });
});
