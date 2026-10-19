import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';
import { SessionService } from '@core/auth/session.service';
import { DialogService } from '@core/dialog/dialog.service';
import { ShowcaseDemoApi } from '../../data/showcase-demo.api';
import { DialogsPage } from './dialogs-page';

describe('DialogsPage', () => {
  const dialogs = { warning: vi.fn().mockResolvedValue(undefined), info: vi.fn() };
  const demoApi = { protectedData: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        { provide: DialogService, useValue: dialogs },
        { provide: ShowcaseDemoApi, useValue: demoApi },
      ],
    });
  });

  it('handles the 409 with a dedicated message and declines other errors', () => {
    const page = TestBed.createComponent(DialogsPage).componentInstance;

    expect(page.handleConflict(new HttpErrorResponse({ status: 409 }))).toBe(true);
    expect(dialogs.warning).toHaveBeenCalled();
    expect(page.handleConflict(new HttpErrorResponse({ status: 500 }))).toBe(false);
  });

  it('asks to log in before simulating the token refresh', async () => {
    const fixture = TestBed.createComponent(DialogsPage);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Inicia sesión para probarlo');
  });

  it('replaces the token with an expired one and fires three protected requests', async () => {
    TestBed.inject(SessionService).start({
      accessToken: 'mock.1.999',
      user: { id: 1, displayName: 'Demo' },
    });
    demoApi.protectedData.mockReturnValue(
      of({ code: 'OK', message: '', data: { serverTime: '' } }),
    );
    const fixture = TestBed.createComponent(DialogsPage);

    fixture.componentInstance.simulateExpiredToken();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Token vencido: mock.1.0');
    expect(demoApi.protectedData).toHaveBeenCalledTimes(3);
  });
});
