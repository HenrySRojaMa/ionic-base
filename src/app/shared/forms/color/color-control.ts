import { Component } from '@angular/core';
import { IonNote } from '@ionic/angular';
import { BaseControl } from '../base-control';
import { ControlLabel } from '../control-label/control-label';

/**
 * Selector de color (valor hex "#rrggbb").
 *
 * ion-input no admite type="color", así que este control usa el
 * <input type="color"> nativo: en Android/iOS abre el selector de color del
 * sistema y en web el del navegador. Muestra el hex al lado para poder leerlo.
 *
 *   <app-color label="Primario" [formField]="f.primary" />
 */
@Component({
  selector: 'app-color',
  imports: [IonNote, ControlLabel],
  template: `
    <div class="flex flex-col gap-1">
      @if (label()) {
        <span class="text-sm"><app-control-label [text]="label()" [required]="required()" /></span>
      }
      <label
        class="swatch flex items-center gap-3 rounded-lg px-3 py-2"
        [class.invalid]="showError()"
      >
        <input
          type="color"
          class="h-8 w-12 cursor-pointer"
          [value]="value() || '#000000'"
          [disabled]="disabled()"
          [attr.aria-label]="label() || 'Color'"
          (input)="value.set($any($event.target).value)"
          (blur)="markAsTouched()"
        />
        <span class="font-mono text-sm">{{ value() || 'Sin color' }}</span>
      </label>
      @if (errorMessage(); as message) {
        <ion-note color="danger" role="alert">{{ message }}</ion-note>
      } @else if (hint()) {
        <ion-note>{{ hint() }}</ion-note>
      }
    </div>
  `,
  // El borde usa las variables de Ionic: se adapta al modo oscuro y a la paleta.
  styles: `
    .swatch {
      border: 1px solid var(--ion-color-medium, #92949c);
    }
    .swatch.invalid {
      border-color: var(--ion-color-danger, #c5000f);
    }
  `,
})
export class ColorControl extends BaseControl<string> {}
