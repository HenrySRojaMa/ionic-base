import { InjectionToken } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

/**
 * Propiedades que acompañan a cada error de Signal Forms. Los errores de Angular
 * se identifican por "kind": required, email, minLength (con minLength),
 * maxLength, min, max, pattern, parse...
 */
export interface ErrorDetails extends ValidationError {
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly min?: unknown;
  readonly max?: unknown;
}

export type ErrorMessages = Record<string, (error: ErrorDetails) => string>;

export const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  required: () => 'Este campo es obligatorio.',
  email: () => 'Ingresa un correo electrónico válido.',
  minLength: (e) => `Debe tener al menos ${e.minLength} caracteres.`,
  maxLength: (e) => `No puede superar los ${e.maxLength} caracteres.`,
  min: (e) => `El valor mínimo es ${e.min}.`,
  max: (e) => `El valor máximo es ${e.max}.`,
  pattern: () => 'El formato no es válido.',
  parse: () => 'El valor ingresado no es válido.',
  digits: () => 'Solo se permiten números.',
  mismatch: () => 'Los valores no coinciden.',
  minItems: (e) =>
    e.min === 1
      ? 'Debe agregar al menos un elemento.'
      : `Debe agregar al menos ${e.min} elementos.`,
};

/**
 * Mensajes de error de los formularios, reemplazables por proyecto:
 *
 *   providers: [{
 *     provide: FORM_ERROR_MESSAGES,
 *     useValue: { ...DEFAULT_ERROR_MESSAGES, ruc: () => 'RUC inválido.' },
 *   }]
 */
export const FORM_ERROR_MESSAGES = new InjectionToken<ErrorMessages>('FORM_ERROR_MESSAGES', {
  providedIn: 'root',
  factory: () => DEFAULT_ERROR_MESSAGES,
});

/**
 * Mensaje del PRIMER error. Si el error trae su propio "message" (por ejemplo,
 * required(p.name, { message: 'Ingresa tu nombre' })), ese tiene prioridad.
 */
export function firstErrorMessage(
  errors: readonly ValidationError[],
  messages: ErrorMessages,
): string | null {
  const [error] = errors;
  if (!error) return null;
  if (error.message) return error.message;
  const message = messages[error.kind];
  return message ? message(error as ErrorDetails) : 'El valor no es válido.';
}
