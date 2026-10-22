import { Service, inject, signal } from '@angular/core';
import { StorageService } from '@core/platform/storage.service';

const PINNED_STORAGE_KEY = 'app.menu-pinned';

/**
 * ¿El menú lateral queda FIJO en pantallas anchas o se contrae?
 *
 * - Fijo (por defecto): ion-split-pane lo muestra al lado del contenido.
 * - Contraído: el split-pane se desactiva, el contenido usa todo el ancho y el
 *   menú se abre como overlay con el botón ☰ de cada página (ion-menu-button
 *   aparece solo cuando el menú no está fijo).
 *
 * En el teléfono no aplica: ahí el menú siempre es deslizable.
 * La elección se recuerda con StorageService (Preferences en nativo).
 */
@Service()
export class SideMenuState {
  private readonly storage = inject(StorageService);
  private readonly pinnedState = signal(true);

  readonly pinned = this.pinnedState.asReadonly();

  /** Se resuelve cuando ya se aplicó la preferencia guardada (útil en pruebas). */
  readonly ready: Promise<void> = this.storage.get(PINNED_STORAGE_KEY).then((saved) => {
    if (saved === 'false') this.pinnedState.set(false);
  });

  toggle(): void {
    this.pinnedState.update((pinned) => !pinned);
    void this.storage.set(PINNED_STORAGE_KEY, String(this.pinnedState()));
  }
}
