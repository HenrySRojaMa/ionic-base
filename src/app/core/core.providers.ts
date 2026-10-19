import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

/**
 * Infraestructura de toda la aplicación (HTTP, sesión, interceptores, tema...).
 * Equivale al CoreModule de la versión con NgModules, pero como función:
 *
 *   // app.config.ts
 *   providers: [provideCore(), provideRouter(routes)]
 *
 * makeEnvironmentProviders garantiza que solo se pueda usar a nivel de
 * aplicación o de rutas (no dentro de un componente). Irá recibiendo los
 * providers de cada pieza a medida que se agreguen.
 */
export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([]);
}
