import { Component, inject } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
} from '@ionic/angular';
import { PlatformService } from '@core/platform/platform.service';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';

const PLATFORM_LABELS = { web: 'Web (navegador)', android: 'Android', ios: 'iOS' } as const;

/**
 * Inicio: presenta la base y muestra DÓNDE está corriendo. Abrir la misma app
 * en el navegador y en el teléfono cambia esta tarjeta: es la forma más rápida
 * de comprobar que el build nativo funciona.
 */
@Component({
  selector: 'app-home-page',
  imports: [
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    PageToolbar,
  ],
  templateUrl: './home-page.html',
})
export class HomePage {
  private readonly platform = inject(PlatformService);

  protected readonly platformLabel = PLATFORM_LABELS[this.platform.platform];
  protected readonly isNative = this.platform.isNative;
}
