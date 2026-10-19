import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { ApiService, toHttpParams } from './api.service';
import { DIALOG_OPTIONS, SKIP_AUTH } from './http-context.tokens';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('prefixes the base url and uses the right verb', () => {
    api.put('users/1', { body: { name: 'Ana' } }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}users/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Ana' });
    req.flush({});
  });

  it('translates dialog and auth options into the HttpContext', () => {
    const custom = () => true;
    api.get('items', { success: true, error: true, custom, skipAuth: true }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}items`);
    expect(req.request.context.get(DIALOG_OPTIONS)).toEqual({ success: true, error: true, custom });
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);
    req.flush({});
  });

  it('uses safe defaults when no options are given', () => {
    api.get('items').subscribe();

    const req = http.expectOne(`${environment.apiUrl}items`);
    expect(req.request.context.get(DIALOG_OPTIONS)).toEqual({});
    expect(req.request.context.get(SKIP_AUTH)).toBe(false);
    expect(req.request.withCredentials).toBe(false);
    req.flush({});
  });
});

describe('toHttpParams', () => {
  it('skips null and undefined values', () => {
    const params = toHttpParams({ a: 1, b: null, c: undefined, d: false });
    expect(params.keys()).toEqual(['a', 'd']);
    expect(params.get('d')).toBe('false');
  });

  it('repeats array values', () => {
    expect(toHttpParams({ id: [1, 2] }).toString()).toBe('id=1&id=2');
  });
});
