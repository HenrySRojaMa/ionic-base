import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chatbubbleEllipsesOutline,
  documentTextOutline,
  gitNetworkOutline,
  listOutline,
  colorPaletteOutline,
} from 'ionicons/icons';

interface ShowcaseTab {
  label: string;
  /** Ruta hija (relativa a /showcase): ion-tab-button la usa como "tab". */
  path: string;
  icon: string;
}

/**
 * Contenedor del showcase con pestañas inferiores (ion-tabs): la navegación por
 * secciones típica de una app móvil. Cada pestaña es una ruta hija con su
 * propia pila de navegación: al volver a una pestaña, sigue donde se dejó.
 *
 * Documentación viva de la base. Se borra al iniciar un proyecto (con su ruta
 * y su ítem de menú).
 */
@Component({
  selector: 'app-showcase-shell',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        @for (tab of tabs; track tab.path) {
          <ion-tab-button [tab]="tab.path">
            <ion-icon [name]="tab.icon" aria-hidden="true" />
            <ion-label>{{ tab.label }}</ion-label>
          </ion-tab-button>
        }
      </ion-tab-bar>
    </ion-tabs>
  `,
  // ion-tabs contiene un ion-router-outlet: la guía de zoneless de Ionic pide Eager (ver App).
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ShowcaseShell {
  protected readonly tabs: ShowcaseTab[] = [
    { label: 'Formularios', path: 'forms', icon: 'document-text-outline' },
    { label: 'Cascada', path: 'cascade', icon: 'git-network-outline' },
    { label: 'Tabla', path: 'table', icon: 'list-outline' },
    { label: 'Diálogos', path: 'dialogs', icon: 'chatbubble-ellipses-outline' },
    { label: 'Tema', path: 'theme', icon: 'color-palette-outline' },
  ];

  constructor() {
    addIcons({
      documentTextOutline,
      gitNetworkOutline,
      listOutline,
      chatbubbleEllipsesOutline,
      colorPaletteOutline,
    });
  }
}
