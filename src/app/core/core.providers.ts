import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { authInterceptor } from './http/interceptors/auth.interceptor';

/**
 * Infraestructura de toda la aplicación (HTTP, sesión, interceptores, tema...).
 * Se registra una vez en app.config.ts: providers: [provideCore(), ...].
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Desde Angular 22 HttpClient usa fetch() por defecto (ya no hace falta withFetch()).
    // El ORDEN del arreglo es el orden en que la petición atraviesa los interceptores.
    provideHttpClient(withInterceptors([authInterceptor])),

    // Recupera la sesión al abrir la app: en web con la cookie, en nativo con el
    // refresh token guardado (por eso en el teléfono la sesión sobrevive a cerrar la app).
    provideAppInitializer(() => inject(AuthService).restoreSession()),
  ]);
}
