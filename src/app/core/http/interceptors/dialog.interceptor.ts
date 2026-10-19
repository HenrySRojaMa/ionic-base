import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { DialogService } from '../../dialog/dialog.service';
import { ApiErrorBody } from '../../models/api-response.model';
import { DIALOG_OPTIONS } from '../http-context.tokens';
import { httpErrorMessage } from '../http-error-message';

const DEFAULT_SUCCESS_MESSAGE = 'La operación se realizó correctamente.';

/**
 * Muestra los diálogos de respuesta según las opciones de CADA petición
 * (ApiService: { success, error, custom }). Misma lógica que en la base legacy:
 * custom primero, luego el error genérico; ignora los 401 y siempre re-lanza.
 */
export const dialogInterceptor: HttpInterceptorFn = (request, next) => {
  const options = request.context.get(DIALOG_OPTIONS);
  if (!options.success && !options.error && !options.custom) {
    return next(request);
  }

  const dialogs = inject(DialogService);

  return next(request).pipe(
    tap((event) => {
      if (options.success && event instanceof HttpResponse) {
        const body = event.body as ApiErrorBody | null;
        void dialogs.success(body?.message || DEFAULT_SUCCESS_MESSAGE);
      }
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status !== HttpStatusCode.Unauthorized) {
        const handled = options.custom?.(error) ?? false;
        if (!handled && options.error) {
          void dialogs.error(httpErrorMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
