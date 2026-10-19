import { Service } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export type AppPlatform = 'web' | 'android' | 'ios';

/**
 * Dónde corre la app. Es el ÚNICO lugar que pregunta a Capacitor por la
 * plataforma: el resto del código depende de este servicio (fácil de simular
 * en pruebas y de cambiar).
 */
@Service()
export class PlatformService {
  /** true dentro de la app nativa (Android/iOS); false en el navegador. */
  readonly isNative = Capacitor.isNativePlatform();
  readonly platform = Capacitor.getPlatform() as AppPlatform;
}
