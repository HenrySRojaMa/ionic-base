import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
  ]);
}
