import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, minLength, required } from '@angular/forms/signals';
import { digits, matches, minItems } from './app-validators';
import { DEFAULT_ERROR_MESSAGES, firstErrorMessage } from './error-messages';

describe('custom Signal Forms validators', () => {
  /** form() necesita un contexto de inyección (lo da el injector de TestBed). */
  const build = () =>
    form(
      signal({ id: '', password: 'abc', confirm: 'abd', items: [] as string[] }),
      (p) => {
        digits(p.id);
        matches(p.confirm, p.password);
        minItems(p.items, 1);
      },
      { injector: TestBed.inject(Injector) },
    );

  it('digits accepts empty values and rejects letters', () => {
    const f = build();
    expect(f.id().errors()).toEqual([]);

    f.id().value.set('12a');
    expect(f.id().errors()[0]?.kind).toBe('digits');

    f.id().value.set('0991');
    expect(f.id().valid()).toBe(true);
  });

  it('matches compares two fields of the same form', () => {
    const f = build();
    expect(f.confirm().errors()[0]?.kind).toBe('mismatch');

    f.confirm().value.set('abc');
    expect(f.confirm().valid()).toBe(true);
  });

  it('minItems validates array length', () => {
    const f = build();
    expect(f.items().errors()[0]?.kind).toBe('minItems');

    f.items().value.set(['a']);
    expect(f.items().valid()).toBe(true);
  });
});

describe('firstErrorMessage', () => {
  it('builds the message from the Angular error details', () => {
    const f = form(signal({ name: 'ab' }), (p) => minLength(p.name, 5), {
      injector: TestBed.inject(Injector),
    });
    expect(firstErrorMessage(f.name().errors(), DEFAULT_ERROR_MESSAGES)).toBe(
      'Debe tener al menos 5 caracteres.',
    );
  });

  it('prefers the message declared in the schema', () => {
    const f = form(
      signal({ name: '' }),
      (p) => required(p.name, { message: 'Ingresa tu nombre' }),
      {
        injector: TestBed.inject(Injector),
      },
    );
    expect(firstErrorMessage(f.name().errors(), DEFAULT_ERROR_MESSAGES)).toBe('Ingresa tu nombre');
  });

  it('falls back to a generic message and returns null without errors', () => {
    expect(firstErrorMessage([{ kind: 'unknown' }], DEFAULT_ERROR_MESSAGES)).toBe(
      'El valor no es válido.',
    );
    expect(firstErrorMessage([], DEFAULT_ERROR_MESSAGES)).toBeNull();
  });
});
