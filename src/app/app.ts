import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

/**
 * Componente raíz: ion-app + ion-router-outlet. El esqueleto vive en layout/.
 *
 * ion-router-outlet (y no router-outlet): además de enrutar, anima las
 * transiciones entre páginas y conserva en memoria las páginas anteriores,
 * como una app nativa (al volver atrás, la página no se reconstruye).
 *
 * Eager: en Angular 22 los componentes son OnPush por defecto y la guía de
 * zoneless de Ionic pide que el componente que aloja ion-router-outlet sea Eager.
 */
@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: '<ion-app><ion-router-outlet /></ion-app>',
  // Excepción deliberada a la regla de OnPush: lo pide la guía de zoneless de Ionic.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {}
