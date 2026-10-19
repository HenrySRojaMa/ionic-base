import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

/**
 * Infraestructura de toda la aplicación (HTTP, sesión, interceptores, tema...).
 * Se registra una vez en app.config.ts: providers: [provideCore(), ...].
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Desde Angular 22 HttpClient usa fetch() por defecto (ya no hace falta withFetch()).
    provideHttpClient(),
  ]);
}
