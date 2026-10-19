import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ApiErrorBody } from '../models/api-response.model';

/**
 * Traduce un error HTTP a un mensaje para el usuario.
 * Prioridad: el mensaje que envía la API; si no hay, uno genérico según el estado.
 */
export function httpErrorMessage(error: HttpErrorResponse): string {
  const body = error.error as ApiErrorBody | string | null;
  if (body && typeof body === 'object' && body.message) return body.message;
  if (typeof body === 'string' && body.trim()) return body;

  switch (error.status) {
    case 0:
      return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    case HttpStatusCode.BadRequest:
      return 'La solicitud no es válida.';
    case HttpStatusCode.Forbidden:
      return 'No tienes permisos para realizar esta acción.';
    case HttpStatusCode.NotFound:
      return 'No se encontró el recurso solicitado.';
    case HttpStatusCode.Conflict:
      return 'La operación entra en conflicto con datos existentes.';
    default:
      return error.status >= 500
        ? 'Ocurrió un error en el servidor. Intenta nuevamente.'
        : 'Ocurrió un error inesperado.';
  }
}
