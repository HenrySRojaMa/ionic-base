import { InjectionToken } from '@angular/core';

/**
 * Lo que app-image-file necesita para obtener una imagen: un File o null si el
 * usuario cancela.
 *
 * Inversión de dependencias: shared NO puede importar core (reglas de capas),
 * así que shared declara la necesidad (este contrato) y core la cumple
 * registrando su MediaService (cámara/galería con Capacitor) en provideCore().
 * En las pruebas se registra un falso.
 */
export interface ImagePicker {
  pickImage(options?: { maxWidth?: number }): Promise<File | null>;
}

export const IMAGE_PICKER = new InjectionToken<ImagePicker>('IMAGE_PICKER', {
  providedIn: 'root',
  factory: () => {
    throw new Error('IMAGE_PICKER no está registrado: provideCore() lo registra.');
  },
});
