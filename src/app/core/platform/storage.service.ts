import { Service } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Almacenamiento clave-valor persistente en todas las plataformas:
 * - Android/iOS: almacenamiento nativo (SharedPreferences / UserDefaults).
 *   localStorage NO es confiable en apps nativas: el sistema puede borrarlo.
 * - Web: Capacitor usa localStorage por debajo.
 *
 * Es asíncrono (Promise) porque en nativo cruza el puente JS <-> nativo.
 *
 * Seguridad: Preferences NO cifra. Para datos sensibles en producción (por
 * ejemplo, el refresh token) conviene un plugin de almacenamiento seguro
 * (Keychain/Keystore). Como todo pasa por este servicio, cambiarlo es local.
 */
@Service()
export class StorageService {
  async get(key: string): Promise<string | null> {
    return (await Preferences.get({ key })).value;
  }

  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
