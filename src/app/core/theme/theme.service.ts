import { DOCUMENT } from '@angular/common';
import { Service, effect, inject, signal } from '@angular/core';
import {
  PALETTE_CSS_VARIABLES,
  ThemePalette,
  paletteToCssVariables,
} from '@shared/theme/theme-palette';
import { StorageService } from '../platform/storage.service';

export type ThemeMode = 'light' | 'dark';

const MODE_STORAGE_KEY = 'app.theme-mode';

/**
 * Tema global: modo claro/oscuro (clase ion-palette-dark en <html>, la paleta
 * oscura oficial de Ionic) y paleta de colores (variables --ion-color-* en <html>).
 *
 * Mismo patrón que la base moderna: el ESTADO son signals y la SINCRONIZACIÓN
 * con el exterior (DOM y almacenamiento) la hacen effect().
 *
 * Diferencia móvil: el modo se guarda con StorageService (asíncrono) y no con
 * localStorage, que no es confiable en apps nativas. Por eso arranca con la
 * preferencia del sistema y aplica el modo guardado en cuanto termina de leerlo.
 */
@Service()
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);
  private readonly root = this.document.documentElement;

  private readonly modeState = signal<ThemeMode>(this.systemMode());
  private readonly paletteState = signal<ThemePalette>({});

  readonly mode = this.modeState.asReadonly();
  readonly palette = this.paletteState.asReadonly();

  /** Se resuelve cuando ya se aplicó el modo guardado (útil en pruebas). */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.storage.get(MODE_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') this.modeState.set(saved);
    });

    effect(() => {
      const mode = this.modeState();
      this.root.classList.toggle('ion-palette-dark', mode === 'dark');
      void this.storage.set(MODE_STORAGE_KEY, mode);
    });

    effect(() => {
      const variables = paletteToCssVariables(this.paletteState());
      for (const name of PALETTE_CSS_VARIABLES) this.root.style.removeProperty(name);
      for (const [name, value] of Object.entries(variables)) {
        this.root.style.setProperty(name, value);
      }
    });
  }

  setMode(mode: ThemeMode): void {
    this.modeState.set(mode);
  }

  toggleMode(): void {
    this.modeState.update((mode) => (mode === 'light' ? 'dark' : 'light'));
  }

  setPalette(palette: ThemePalette): void {
    this.paletteState.set(palette);
  }

  resetPalette(): void {
    this.paletteState.set({});
  }

  private systemMode(): ThemeMode {
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
    return prefersDark?.matches ? 'dark' : 'light';
  }
}
