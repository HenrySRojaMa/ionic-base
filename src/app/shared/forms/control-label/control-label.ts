import { Component, input } from '@angular/core';
import { IonText } from '@ionic/angular';

/**
 * Etiqueta de los controles con el asterisco de obligatorio.
 *
 * Los controles de Ionic (ion-input, ion-select, ion-textarea) dibujan su
 * etiqueta, ayuda y error por dentro; solo la etiqueta admite contenido propio
 * mediante slot="label". Este componente se proyecta ahí:
 *
 *   <ion-input ...>
 *     <app-control-label slot="label" [text]="label()" [required]="required()" />
 *   </ion-input>
 *
 * Reemplaza al app-field de las bases web: en Ionic no hace falta envoltorio.
 */
@Component({
  selector: 'app-control-label',
  imports: [IonText],
  template: `{{ text() }}
    @if (required()) {
      <ion-text color="danger" aria-hidden="true">*</ion-text>
    }`,
})
export class ControlLabel {
  readonly text = input('');
  readonly required = input(false);
}
