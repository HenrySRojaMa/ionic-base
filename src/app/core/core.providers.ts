import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { authInterceptor } from './http/interceptors/auth.interceptor';
import { dialogInterceptor } from './http/interceptors/dialog.interceptor';
import { IMAGE_PICKER } from '@shared/forms/image-file/image-picker';
import { MediaService } from './platform/media.service';

/**
 * Infraestructura de toda la aplicación (HTTP, sesión, interceptores, tema...).
 * Se registra una vez en app.config.ts: providers: [provideCore(), ...].
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Desde Angular 22 HttpClient usa fetch() por defecto (ya no hace falta withFetch()).
    // El ORDEN del arreglo es el orden en que la petición atraviesa los interceptores.
    provideHttpClient(withInterceptors([authInterceptor, dialogInterceptor])),

    // Recupera la sesión al abrir la app: en web con la cookie, en nativo con el
    // refresh token guardado (por eso en el teléfono la sesión sobrevive a cerrar la app).
    provideAppInitializer(() => inject(AuthService).restoreSession()),

    // shared/forms declara qué necesita (IMAGE_PICKER); core aporta la implementación nativa.
    { provide: IMAGE_PICKER, useExisting: MediaService },
  ]);
}
