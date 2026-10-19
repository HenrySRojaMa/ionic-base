import { Component, input } from '@angular/core';
import { IonTextarea } from '@ionic/angular';
import { BaseControl } from '../base-control';
import { ControlLabel } from '../control-label/control-label';

/**
 * Área de texto genérica sobre ion-textarea.
 *
 * El contador de caracteres ya viene en Ionic (counter + maxlength): no hay que
 * dibujarlo a mano como en las bases web. maxLength usa el nombre del contrato
 * FormUiControl, así que maxLength(p.bio, 300) en el esquema alimenta el
 * contador y el límite nativo.
 *
 * autoGrow: crece con el texto en vez de mostrar barra de desplazamiento, lo
 * habitual en el teléfono.
 */
@Component({
  selector: 'app-text-area',
  imports: [IonTextarea, ControlLabel],
  template: `
    <ion-textarea
      [class]="ionClasses()"
      fill="outline"
      labelPlacement="stacked"
      [rows]="rows()"
      [autoGrow]="autoGrow()"
      [value]="value() ?? ''"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [required]="required()"
      [maxlength]="maxLength()"
      [counter]="maxLength() !== undefined"
      [helperText]="hint()"
      [errorText]="errorMessage() ?? ''"
      (ionInput)="onInput($event)"
      (ionBlur)="markAsTouched()"
    >
      <app-control-label slot="label" [text]="label()" [required]="required()" />
    </ion-textarea>
  `,
})
export class TextAreaControl extends BaseControl<string> {
  readonly rows = input(4);
  readonly maxLength = input<number | undefined>();
  readonly autoGrow = input(true);

  /** Convención de Signal Forms: el texto vacío es '' (no null). */
  protected onInput(event: Event): void {
    this.value.set((event as CustomEvent<{ value?: string | null }>).detail.value ?? '');
  }
}
