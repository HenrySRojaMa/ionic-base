import { Component, input } from '@angular/core';
import { IonSelect, IonSelectOption } from '@ionic/angular';
import { BaseControl } from '../base-control';
import { ControlLabel } from '../control-label/control-label';
import { SelectOption } from './select-option';

/** Cómo se muestran las opciones: popover (junto al campo), hoja inferior, alerta o modal. */
export type SelectOverlay = 'popover' | 'action-sheet' | 'alert' | 'modal';

/**
 * Select genérico sobre ion-select (el tipo del valor se infiere de las opciones).
 *
 * Mismas reglas que en las bases web:
 * - Nunca modifica el valor del formulario por su cuenta. ion-select compara el
 *   valor con las opciones (===); si no está (la lista aún no cargó), muestra el
 *   placeholder y el valor queda intacto. Al llegar la opción, la muestra.
 * - (valueChange) se emite SOLO cuando el usuario elige: ionChange de Ionic
 *   solo se dispara por interacción del usuario, y model() solo emite cuando el
 *   propio componente hace set().
 *
 * Ventaja de Ionic: las opciones pueden tener cualquier tipo de valor (números,
 * objetos) sin el truco de los índices que necesitaba el <select> nativo.
 */
@Component({
  selector: 'app-select',
  imports: [IonSelect, IonSelectOption, ControlLabel],
  templateUrl: './select-control.html',
})
export class SelectControl<T> extends BaseControl<T> {
  readonly options = input<readonly SelectOption<T>[]>([]);
  /** Permite volver a "sin selección". */
  readonly allowNull = input(false);
  readonly overlay = input<SelectOverlay>('popover');

  protected onChange(event: Event): void {
    this.value.set((event as CustomEvent<{ value: T | null }>).detail.value ?? null);
  }
}
