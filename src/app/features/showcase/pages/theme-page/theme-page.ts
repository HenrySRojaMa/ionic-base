import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonProgressBar,
  IonToggle,
} from '@ionic/angular';
import { ThemeService } from '@core/theme/theme.service';
import { ColorControl } from '@shared/forms/color/color-control';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';
import { ThemePalette } from '@shared/theme/theme-palette';
import { ThemeScope } from '@shared/theme/theme-scope';

/**
 * Editor de paleta con vista previa EN SU PROPIO ÁMBITO (appThemeScope): el
 * resto de la app no cambia hasta "Aplicar a toda la app".
 *
 * Misma lógica que la base moderna (el modelo del formulario ES la paleta).
 * La vista previa usa componentes de Ionic con color="primary", "secondary"...:
 * cada uno lee las variables --ion-color-* heredadas del bloque.
 */
@Component({
  selector: 'app-theme-page',
  imports: [
    FormField,
    ColorControl,
    ThemeScope,
    PageToolbar,
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonChip,
    IonToggle,
    IonProgressBar,
  ],
  templateUrl: './theme-page.html',
})
export class ThemePage {
  private readonly theme = inject(ThemeService);

  protected readonly model = signal<Required<ThemePalette>>({
    primary: '#2563eb',
    secondary: '#db2777',
    accent: '#0d9488',
    neutral: '#374151',
    base: '#ffffff',
  });
  protected readonly f = form(this.model);

  protected applyToApp(): void {
    this.theme.setPalette(this.model());
  }

  protected resetApp(): void {
    this.theme.resetPalette();
  }
}
