import {
  Directive,
  ElementRef,
  Renderer2,
  RendererStyleFlags2,
  effect,
  inject,
  input,
} from '@angular/core';
import { PALETTE_CSS_VARIABLES, ThemePalette, paletteToCssVariables } from './theme-palette';

/**
 * Aplica una paleta SOLO dentro del elemento que la lleva (y sus hijos):
 *
 *   <section [appThemeScope]="previewPalette()">
 *     <ion-button color="primary">Vista previa</ion-button>
 *
 * Las variables CSS se heredan: lo que se define aquí solo afecta a los
 * descendientes. Los componentes de Ionic leen --ion-color-* heredadas, así que
 * un ion-button color="primary" dentro del bloque usa el color de la vista previa.
 *
 * Legacy: @Input + ngOnChanges. Moderno: input() + effect(), que se vuelve a
 * ejecutar solo cuando cambia el signal de la paleta.
 */
@Directive({ selector: '[appThemeScope]' })
export class ThemeScope {
  readonly palette = input<ThemePalette | null>(null, { alias: 'appThemeScope' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const variables = paletteToCssVariables(this.palette() ?? {});
      for (const name of PALETTE_CSS_VARIABLES) {
        this.renderer.removeStyle(this.host, name, RendererStyleFlags2.DashCase);
      }
      for (const [name, value] of Object.entries(variables)) {
        this.renderer.setStyle(this.host, name, value, RendererStyleFlags2.DashCase);
      }
    });
  }
}
