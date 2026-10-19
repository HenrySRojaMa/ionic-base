import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { LoginPage, safeReturnUrl } from './login-page';

type IonInputElement = HTMLElement & { value: string; errorText: string };

describe('LoginPage', () => {
  const auth = { login: vi.fn() };
  const session = { accessToken: 't', user: { id: 1, displayName: 'Demo' } };

  async function setup(returnUrl?: string) {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LoginPage);
    if (returnUrl) fixture.componentRef.setInput('returnUrl', returnUrl);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll<IonInputElement>('ion-input');
    /** Simula escribir en ion-input: cambia su valor y emite ionInput. */
    const type = async (index: number, text: string) => {
      inputs[index].value = text;
      inputs[index].dispatchEvent(new CustomEvent('ionInput', { detail: { value: text } }));
      await fixture.whenStable();
    };
    const submit = async () => {
      element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
      // La acción de envío es asíncrona: se deja correr antes de revisar la pantalla.
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    };
    return { router, inputs, type, submit };
  }

  it('does not call the API and shows errors when the form is empty', async () => {
    const { inputs, submit } = await setup();

    await submit();

    expect(auth.login).not.toHaveBeenCalled();
    expect(inputs[0].errorText).toBe('Este campo es obligatorio.');
  });

  it('logs in and replaces the history with the requested internal page', async () => {
    const { router, type, submit } = await setup('/reportes?mes=5');
    auth.login.mockReturnValue(of(session));
    await type(0, 'demo');
    await type(1, 'demo123');

    await submit();

    expect(auth.login).toHaveBeenCalledWith({ username: 'demo', password: 'demo123' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/reportes?mes=5', { replaceUrl: true });
  });

  it('clears the password after a failed login', async () => {
    const { inputs, type, submit } = await setup();
    auth.login.mockReturnValue(throwError(() => new Error('400')));
    await type(0, 'demo');
    await type(1, 'mal');

    await submit();

    expect(inputs[1].value).toBe('');
  });
});

describe('safeReturnUrl', () => {
  it('accepts internal paths and rejects external ones (open redirect)', () => {
    expect(safeReturnUrl('/reportes')).toBe('/reportes');
    expect(safeReturnUrl('//evil.com')).toBe('/');
    expect(safeReturnUrl('https://evil.com')).toBe('/');
    expect(safeReturnUrl(undefined)).toBe('/');
  });
});
