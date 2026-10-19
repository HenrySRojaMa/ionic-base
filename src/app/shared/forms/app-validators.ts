import { SchemaPath, ValidationError, validate } from '@angular/forms/signals';

/**
 * Validadores propios para Signal Forms.
 *
 * En Signal Forms los validadores se DECLARAN en el esquema del formulario:
 *
 *   form(model, (p) => {
 *     required(p.idNumber);          // de @angular/forms/signals
 *     digits(p.idNumber);            // propio
 *     matches(p.confirm, p.password);
 *   });
 *
 * Cada regla es una función que recibe la ruta (path) del campo y registra la
 * validación con validate(). Devuelve un error { kind } o undefined si es válido.
 */

/** Solo dígitos (cédulas, teléfonos). Un valor vacío es válido: combinar con required. */
export function digits(path: SchemaPath<string | null>): void {
  validate(path, ({ value }) => {
    const text = value();
    return !text || /^\d+$/.test(text) ? undefined : { kind: 'digits' };
  });
}

export interface MinItemsError extends ValidationError {
  readonly kind: 'minItems';
  readonly min: number;
}

/** Para campos cuyo valor es un arreglo (por ejemplo, una tabla): mínimo de elementos. */
export function minItems(path: SchemaPath<readonly unknown[] | null>, min: number): void {
  validate(path, ({ value }) => {
    if ((value()?.length ?? 0) >= min) return undefined;
    const error: MinItemsError = { kind: 'minItems', min };
    return error;
  });
}

/**
 * El campo debe ser igual a otro (confirmar contraseña). Es una validación
 * cruzada: valueOf() lee el valor de otro campo del mismo formulario.
 * (En la base legacy era un validador de GRUPO sobre el FormGroup.)
 */
export function matches<T>(path: SchemaPath<T>, other: SchemaPath<T>): void {
  validate(path, ({ value, valueOf }) =>
    value() === valueOf(other) ? undefined : { kind: 'mismatch' },
  );
}
