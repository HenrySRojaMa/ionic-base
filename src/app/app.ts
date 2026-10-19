import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircle } from 'ionicons/icons';

/**
 * Componente raíz. Con standalone, cada componente de Ionic se importa por
 * separado desde '@ionic/angular' (solo se empaqueta lo que se usa) y los
 * íconos se registran con addIcons().
 *
 * Eager: en Angular 22 los componentes son OnPush por defecto. La guía de
 * Ionic pide que el componente que aloja ion-router-outlet sea Eager, para que
 * las páginas que guardan estado en campos simples se sigan actualizando.
 * (Las páginas de esta base usan signals, pero se sigue la recomendación.)
 */
@Component({
  selector: 'app-root',
  imports: [IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon],
  templateUrl: './app.html',
  // Excepción deliberada a la regla de OnPush: lo pide la guía de zoneless de Ionic.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class App {
  protected readonly title = 'ionic-base';

  constructor() {
    addIcons({ checkmarkCircle });
  }
}
