import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonButton,
  IonButtons,
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
import { appsOutline, chevronBackOutline, homeOutline, pinOutline } from 'ionicons/icons';
import { NavigationService } from '../navigation/navigation.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { UserMenu } from '../user-menu/user-menu';
import { SideMenuState } from './side-menu-state';

/**
 * Esqueleto de la app: menú lateral + contenido.
 *
 * ion-split-pane: en pantallas anchas (escritorio, tablet horizontal) el menú
 * queda FIJO a la izquierda; en el teléfono se oculta y se abre deslizando o con
 * el botón de menú. Así la misma app funciona bien como web y como app nativa.
 *
 * En pantallas anchas el usuario puede CONTRAER el menú (SideMenuState): el
 * split-pane se desactiva, el contenido usa todo el ancho y el menú pasa a
 * abrirse con el botón ☰ de la barra de cada página.
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
    IonButtons,
    IonButton,
    IonContent,
    IonList,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    ThemeToggle,
    UserMenu,
  ],
  templateUrl: './main-layout.html',
  // Ancho del menú fijo: por defecto Ionic usa hasta el 28 % de la pantalla
  // (unos 400 px en un monitor), demasiado para una lista de enlaces. Son
  // variables del componente: van en CSS, no en clases de Tailwind.
  styles: `
    ion-split-pane {
      --side-min-width: 240px;
      --side-max-width: 260px;
    }
  `,
  // Aloja un ion-router-outlet: la guía de zoneless de Ionic pide Eager (ver App).
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MainLayout {
  protected readonly appName = 'Ionic Base';
  protected readonly items = inject(NavigationService).items;
  protected readonly menuState = inject(SideMenuState);
  private readonly menu = viewChild.required(IonMenu);

  constructor() {
    addIcons({ homeOutline, appsOutline, chevronBackOutline, pinOutline });
  }

  /** Fijar / contraer. Al fijar desde el overlay abierto, primero se cierra el overlay. */
  protected async togglePinned(): Promise<void> {
    if (!this.menuState.pinned()) await this.menu().close(false);
    this.menuState.toggle();
  }
}
