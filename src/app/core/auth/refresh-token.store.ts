import { Service, inject } from '@angular/core';
import { PlatformService } from '../platform/platform.service';
import { StorageService } from '../platform/storage.service';

const KEY = 'auth.refresh-token';

/**
 * Dónde vive el refresh token según la plataforma:
 * - Web: en una cookie HttpOnly que gestiona el navegador. JavaScript no la
 *   lee ni la escribe: aquí no se guarda nada.
 * - Nativo: las cookies entre orígenes no son confiables dentro de la app, así
 *   que el backend lo entrega en el cuerpo y se guarda con StorageService.
 */
@Service()
export class RefreshTokenStore {
  private readonly platform = inject(PlatformService);
  private readonly storage = inject(StorageService);

  async save(token: string | undefined): Promise<void> {
    if (this.platform.isNative && token) await this.storage.set(KEY, token);
  }

  async read(): Promise<string | null> {
    return this.platform.isNative ? this.storage.get(KEY) : null;
  }

  async clear(): Promise<void> {
    if (this.platform.isNative) await this.storage.remove(KEY);
  }
}
