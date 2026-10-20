import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@env/environment';
import { mockApiInterceptor } from './mock-api.interceptor';

/**
 * Interceptores del backend simulado: solo con mockApi = true.
 *
 * En el build de producción este archivo se REEMPLAZA por
 * mock-interceptors.production.ts (angular.json > fileReplacements), que no
 * importa nada de core/mock. Un "environment.mockApi ? [...] : []" no basta: el
 * import sigue ahí y el código del mock (usuarios y contraseñas de prueba) viaja
 * igual dentro de main.js.
 */
export const MOCK_INTERCEPTORS: HttpInterceptorFn[] = environment.mockApi
  ? [mockApiInterceptor]
  : [];
