import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DialogService } from '../../dialog/dialog.service';
import { DIALOG_OPTIONS, DialogOptions } from '../http-context.tokens';
import { dialogInterceptor } from './dialog.interceptor';

describe('dialogInterceptor', () => {
  const dialogs = { success: vi.fn().mockResolvedValue(undefined), error: vi.fn() };
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([dialogInterceptor])),
        provideHttpClientTesting(),
        { provide: DialogService, useValue: dialogs },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  const get = (options: DialogOptions) =>
    http.get('/x', { context: new HttpContext().set(DIALOG_OPTIONS, options) });

  it('shows the API message on success when requested', () => {
    get({ success: true }).subscribe();
    backend.expectOne('/x').flush({ code: 'OK', message: 'Guardado', data: 1 });

    expect(dialogs.success).toHaveBeenCalledWith('Guardado');
  });

  it('does nothing when no dialog option is set', () => {
    get({}).subscribe({ error: () => undefined });
    backend.expectOne('/x').flush(null, { status: 500, statusText: 'Error' });

    expect(dialogs.error).not.toHaveBeenCalled();
  });

  it('shows the API error message and still rethrows the error', () => {
    let rethrown = false;
    get({ error: true }).subscribe({ error: () => (rethrown = true) });
    backend
      .expectOne('/x')
      .flush({ message: 'Dato duplicado' }, { status: 400, statusText: 'Bad' });

    expect(dialogs.error).toHaveBeenCalledWith('Dato duplicado');
    expect(rethrown).toBe(true);
  });

  it('lets a custom handler replace the generic error dialog', () => {
    const custom = vi.fn().mockReturnValue(true);
    get({ error: true, custom }).subscribe({ error: () => undefined });
    backend.expectOne('/x').flush(null, { status: 409, statusText: 'Conflict' });

    expect(custom).toHaveBeenCalled();
    expect(dialogs.error).not.toHaveBeenCalled();
  });

  it('falls back to the generic dialog when the custom handler declines', () => {
    get({ error: true, custom: () => false }).subscribe({ error: () => undefined });
    backend.expectOne('/x').flush(null, { status: 404, statusText: 'Not found' });

    expect(dialogs.error).toHaveBeenCalledWith('No se encontró el recurso solicitado.');
  });

  it('ignores 401 responses (handled by the auth interceptor)', () => {
    get({ error: true }).subscribe({ error: () => undefined });
    backend.expectOne('/x').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(dialogs.error).not.toHaveBeenCalled();
  });
});
