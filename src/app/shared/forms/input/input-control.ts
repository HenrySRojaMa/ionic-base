import { Component, computed, input } from '@angular/core';
import { IonInput, IonInputPasswordToggle } from '@ionic/angular';
import { BaseControl } from '../base-control';
import { ControlLabel } from '../control-label/control-label';

/** Tipos que admite ion-input (no incluye "color": Ionic no lo soporta). */
export type InputType =
  'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'search' | 'url';

/** Valor que entrega el input: número para type="number", texto para el resto. */
export type InputValue = string | number;

/**
 * Input genérico sobre ion-input. Misma API que en la base moderna:
 *
 * - type="number": entrega number (o null si está vacío).
 * - Texto vacío: entrega '' (convención de Signal Forms).
 * - type="date": acepta fechas ISO completas y muestra "2024-05-01".
 * - digitsOnly: solo deja escribir dígitos (teclado numérico en el teléfono).
 * - type="password": agrega el botón de mostrar/ocultar de Ionic.
 */
@Component({
  selector: 'app-input',
  imports: [IonInput, IonInputPasswordToggle, ControlLabel],
  templateUrl: './input-control.html',
})
export class InputControl extends BaseControl<InputValue> {
  readonly type = input<InputType>('text');
  readonly digitsOnly = input(false);
  // Nombres del contrato FormUiControl: [formField] los rellena desde el esquema.
  readonly min = input<InputValue | undefined>();
  readonly max = input<InputValue | undefined>();
  readonly maxLength = input<number | undefined>();
  readonly step = input<string | undefined>();
  readonly autocomplete = input<'on' | 'off' | 'email' | 'username' | 'current-password'>('off');

  /** Texto que se muestra en ion-input (derivado del valor). */
  protected readonly displayValue = computed(() => {
    const value = this.value();
    if (value === null || value === undefined) return '';
    return this.type() === 'date' ? String(value).split('T')[0] : String(value);
  });

  protected onInput(event: Event): void {
    const element = event.target as HTMLIonInputElement;
    let raw = String((event as CustomEvent<{ value?: string | null }>).detail.value ?? '');

    if (this.digitsOnly()) {
      const digits = raw.replace(/\D/g, '');
      // Patrón recomendado por Ionic para filtrar: reescribir el valor del elemento.
      if (digits !== raw) element.value = digits;
      raw = digits;
    }

    this.value.set(this.parse(raw));
  }

  private parse(raw: string): InputValue | null {
    if (this.type() !== 'number') return raw;
    if (raw === '') return null;
    const number = Number(raw);
    return Number.isNaN(number) ? null : number;
  }
}
