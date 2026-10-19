import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  PartialMatchRouteSnapshot,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { AUTH_PATHS } from './auth-paths';
import { authGuard, authMatchGuard, guestGuard } from './auth.guards';
import { SessionService } from './session.service';

describe('auth guards', () => {
  let session: SessionService;
  let router: Router;
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/private/page' } as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    session = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  const run = <T>(guard: () => T): T => TestBed.runInInjectionContext(guard);
  const login = () => session.start({ accessToken: 't', user: { id: 1, displayName: 'Ana' } });

  it('authGuard lets authenticated users through', () => {
    login();
    expect(run(() => authGuard(route, state))).toBe(true);
  });

  it('authGuard redirects anonymous users to login keeping the return url', () => {
    const result = run(() => authGuard(route, state)) as UrlTree;
    expect(router.serializeUrl(result)).toBe(
      `${AUTH_PATHS.login}?returnUrl=${encodeURIComponent('/private/page')}`,
    );
  });

  it('authMatchGuard rebuilds the return url from the segments', () => {
    const segments = [new UrlSegment('admin', {}), new UrlSegment('users', {})];
    const snapshot = {} as PartialMatchRouteSnapshot; // 3er parámetro de CanMatchFn (Angular 22)
    const result = run(() => authMatchGuard({} as Route, segments, snapshot)) as UrlTree;
    expect(result.queryParams['returnUrl']).toBe('/admin/users');
  });

  it('guestGuard sends authenticated users away from login', () => {
    login();
    const result = run(() => guestGuard(route, state)) as UrlTree;
    expect(router.serializeUrl(result)).toBe(AUTH_PATHS.afterLogin);
  });

  it('guestGuard lets anonymous users through', () => {
    expect(run(() => guestGuard(route, state))).toBe(true);
  });
});
