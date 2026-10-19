import { Component, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonNote,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AUTH_PATHS } from '@core/auth/auth-paths';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '@env/environment';
import { InputControl } from '@shared/forms/input/input-control';

/**
 * La misma página de login de la base moderna (Signal Forms + [formRoot] +
 * acción de envío), dibujada con Ionic. Va fuera del layout principal: no
 * tiene menú lateral.
 */
@Component({
  selector: 'app-login-page',
  imports: [
    FormRoot,
    FormField,
    InputControl,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSpinner,
    IonNote,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Llega desde ?returnUrl= gracias a withComponentInputBinding() en el router. */
  readonly returnUrl = input<string>();

  protected readonly showDemoHint = environment.mockApi;
  protected readonly model = signal({ username: '', password: '' });

  /** [formRoot] valida, marca todo como tocado y solo si es válido ejecuta la acción. */
  protected readonly f = form(
    this.model,
    (p) => {
      required(p.username);
      required(p.password);
    },
    { submission: { action: () => this.login() } },
  );

  private async login(): Promise<undefined> {
    try {
      await firstValueFrom(this.auth.login(this.model()));
      // replaceUrl: el botón "atrás" de Android no debe volver al login.
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()), { replaceUrl: true });
    } catch {
      // El error ya lo muestra el interceptor de diálogos (AuthApi.login usa error: true).
      this.f.password().value.set('');
    }
    return undefined;
  }
}

/**
 * Solo rutas internas: evita "open redirect" (un enlace malicioso con
 * ?returnUrl=https://otro-sitio.com que sacaría al usuario de la app).
 */
export function safeReturnUrl(url: string | undefined): string {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : AUTH_PATHS.afterLogin;
}
