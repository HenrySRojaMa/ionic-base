import { Component, inject } from '@angular/core';
import { IonIcon, IonItem, IonToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline } from 'ionicons/icons';
import { ThemeService } from '@core/theme/theme.service';

/**
 * Interruptor de modo oscuro para el menú lateral: en una app móvil los ajustes
 * suelen estar en el menú, no como botón suelto en la barra.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [IonItem, IonIcon, IonToggle],
  template: `
    <ion-item lines="none">
      <ion-icon slot="start" name="moon-outline" aria-hidden="true" />
      <ion-toggle
        [checked]="theme.mode() === 'dark'"
        (ionChange)="theme.toggleMode()"
        justify="space-between"
        >Modo oscuro</ion-toggle
      >
    </ion-item>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  constructor() {
    addIcons({ moonOutline });
  }
}
