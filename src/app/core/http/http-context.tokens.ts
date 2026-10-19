import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';

/**
 * Opciones de diálogo por petición. Las lee DialogInterceptor.
 *
 * - success: muestra el modal de éxito con el mensaje de la respuesta.
 * - error:   muestra el modal de error genérico.
 * - custom:  manejo dedicado de un error (por ejemplo, abrir un modal propio
 *            para un 409). Devuelve true si lo manejó; en ese caso no se
 *            muestra el modal genérico.
 */
export interface DialogOptions {
  success?: boolean;
  error?: boolean;
  custom?: (error: HttpErrorResponse) => boolean;
}

/**
 * Los HttpContextToken permiten adjuntar datos a UNA petición concreta para
 * que los interceptores los lean. Es la forma de tener comportamiento
 * distinto por petición sin renunciar a los interceptores.
 */
export const DIALOG_OPTIONS = new HttpContextToken<DialogOptions>(() => ({}));

/** La petición no lleva token ni intenta refrescarlo (login, refresh, públicos). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
