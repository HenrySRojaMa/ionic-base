import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline } from 'ionicons/icons';
import { NavigationService } from '../navigation/navigation.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

/**
 * Esqueleto de la app: menú lateral + contenido.
 *
 * ion-split-pane: en pantallas anchas (escritorio, tablet horizontal) el menú
 * queda FIJO a la izquierda; en el teléfono se oculta y se abre deslizando o con
 * el botón de menú. Así la misma app funciona bien como web y como app nativa.
 *
 * Es el equivalente del MainLayout + Navbar de las bases web: en móvil la
 * navegación principal va en un menú lateral (o en pestañas), no en una barra.
 */
@Component({
  selector: 'app-main-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    ThemeToggle,
  ],
  templateUrl: './main-layout.html',
  // Aloja un ion-router-outlet: la guía de zoneless de Ionic pide Eager (ver App).
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MainLayout {
  protected readonly appName = 'Ionic Base';
  protected readonly items = inject(NavigationService).items;

  constructor() {
    addIcons({ homeOutline });
  }
}
