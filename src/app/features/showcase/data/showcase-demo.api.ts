import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/http/api.service';
import { ApiResponse } from '@core/models/api-response.model';

/**
 * Endpoints de demostración del backend simulado.
 * Vive DENTRO de la feature (y no en domain) porque solo la usa el showcase.
 */
@Service()
export class ShowcaseDemoApi {
  private readonly api = inject(ApiService);

  /** success: true -> DialogInterceptor muestra el mensaje de la API. */
  success(): Observable<ApiResponse<null>> {
    return this.api.get('demo/success', { success: true });
  }

  /** error: true -> modal de error genérico con el mensaje de la API. */
  validationError(): Observable<ApiResponse<null>> {
    return this.api.get('demo/error', { error: true });
  }

  /** custom -> manejo dedicado; si devuelve true no se muestra el genérico. */
  conflict(custom: (error: HttpErrorResponse) => boolean): Observable<ApiResponse<null>> {
    return this.api.get('demo/conflict', { error: true, custom });
  }

  serverError(): Observable<ApiResponse<null>> {
    return this.api.get('demo/server-error', { error: true });
  }

  /** Requiere token: si expiró, el interceptor de auth lo refresca y reintenta. */
  protectedData(): Observable<ApiResponse<{ serverTime: string }>> {
    return this.api.get('demo/protected', { error: true });
  }
}
