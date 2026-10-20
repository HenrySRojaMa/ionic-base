import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Versión de producción de mock-interceptors.ts (angular.json > production >
 * fileReplacements): sin backend simulado y sin importar nada de core/mock.
 */
export const MOCK_INTERCEPTORS: HttpInterceptorFn[] = [];
