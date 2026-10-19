import { Component, input } from '@angular/core';
import { IonButtons, IonMenuButton, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Barra superior común a las páginas: botón de menú (solo visible cuando el
 * menú está oculto, es decir, en el teléfono), título y acciones a la derecha
 * (<ng-content>). Se usa dentro del ion-header de cada página:
 *
 *   <ion-header><app-page-toolbar title="Inicio" /></ion-header>
 *   <ion-content>...</ion-content>
 *
 * Cada página de Ionic necesita su propio ion-header + ion-content como hijos
 * directos: así funcionan las transiciones y el desplazamiento nativo.
 */
@Component({
  selector: 'app-page-toolbar',
  imports: [IonToolbar, IonButtons, IonMenuButton, IonTitle],
  template: `
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-menu-button />
      </ion-buttons>
      <ion-title>{{ title() }}</ion-title>
      <ion-buttons slot="end">
        <ng-content />
      </ion-buttons>
    </ion-toolbar>
  `,
})
export class PageToolbar {
  readonly title = input('');
}
