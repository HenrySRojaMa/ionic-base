import { mockApiInterceptor } from './mock-api.interceptor';
import { MOCK_INTERCEPTORS } from './mock-interceptors';
import { MOCK_INTERCEPTORS as PRODUCTION_MOCK_INTERCEPTORS } from './mock-interceptors.production';

/**
 * Las pruebas se compilan con la configuración de desarrollo, así que aquí solo
 * se ve el lado de desarrollo. Que el build de producción no lleve el mock lo
 * comprueba scripts/check-prod-bundle.mjs (npm run build:check).
 */
describe('MOCK_INTERCEPTORS', () => {
  it('registers the mock API in development', () => {
    expect(MOCK_INTERCEPTORS).toEqual([mockApiInterceptor]);
  });

  it('is empty in the production replacement', () => {
    expect(PRODUCTION_MOCK_INTERCEPTORS).toEqual([]);
  });
});
