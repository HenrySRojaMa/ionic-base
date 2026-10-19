import { TestBed } from '@angular/core/testing';
import { Session } from './auth.models';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const session: Session = { accessToken: 'token-1', user: { id: 1, displayName: 'Ana' } };
  let service: SessionService;

  beforeEach(() => (service = TestBed.inject(SessionService)));

  it('starts without a session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
  });

  it('derives the token and user from the session (computed)', () => {
    service.start(session);
    expect(service.accessToken()).toBe('token-1');
    expect(service.user()?.displayName).toBe('Ana');

    service.clear();
    expect(service.session()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
