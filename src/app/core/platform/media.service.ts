import { InjectionToken, Service, inject } from '@angular/core';
import { Camera, CameraErrorCode, CameraPlugin, MediaResult } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { PlatformService } from './platform.service';

/** El plugin de cámara detrás de un token: en pruebas se reemplaza por un falso. */
export const CAMERA = new InjectionToken<CameraPlugin>('CAMERA', {
  providedIn: 'root',
  factory: () => Camera,
});

export interface PickImageOptions {
  /** Ancho máximo en px: la imagen se reduce en el dispositivo antes de entregarla. */
  readonly maxWidth?: number;
  /** Calidad JPEG de 0 a 100. */
  readonly quality?: number;
}

const CANCEL_CODES: readonly string[] = [
  CameraErrorCode.TakePhotoCancelled,
  CameraErrorCode.ChooseMediaCancelled,
];

/**
 * Obtener una imagen del usuario en cualquier plataforma, con UNA sola API:
 *
 *   const file = await media.pickImage({ maxWidth: 1024 });   // File | null
 *
 * - Android/iOS: pregunta el origen (cámara o galería) con una hoja inferior y
 *   usa la cámara/galería nativas (Capacitor Camera).
 * - Web: abre directamente el selector de archivos del navegador (la cámara web
 *   necesitaría PWA Elements; para un formulario el selector basta).
 *
 * Siempre entrega un File (o null si el usuario cancela): el resto de la app no
 * sabe de qué plataforma vino. Usa la API nueva del plugin (takePhoto /
 * chooseFromGallery); getPhoto quedó obsoleta en Capacitor Camera 8.
 */
@Service()
export class MediaService {
  private readonly camera = inject(CAMERA);
  private readonly platform = inject(PlatformService);
  private readonly actionSheets = inject(ActionSheetController);

  async pickImage(options: PickImageOptions = {}): Promise<File | null> {
    const source = this.platform.isNative ? await this.askSource() : 'gallery';
    if (!source) return null;

    const settings = { quality: options.quality ?? 80, targetWidth: options.maxWidth };
    try {
      const result =
        source === 'camera'
          ? await this.camera.takePhoto(settings)
          : (await this.camera.chooseFromGallery({ ...settings, webUseInput: true })).results[0];
      return result ? await toFile(result) : null;
    } catch (error) {
      if (isCancel(error)) return null; // cancelar no es un error
      throw error;
    }
  }

  private async askSource(): Promise<'camera' | 'gallery' | null> {
    const sheet = await this.actionSheets.create({
      header: 'Agregar imagen',
      buttons: [
        { text: 'Tomar foto', data: 'camera' },
        { text: 'Elegir de la galería', data: 'gallery' },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
    const { data } = await sheet.onWillDismiss<'camera' | 'gallery'>();
    return data ?? null;
  }
}

/**
 * webPath sirve en todas las plataformas (blob: en web, capacitor:// en nativo):
 * se lee con fetch y se convierte en File.
 */
async function toFile(result: MediaResult): Promise<File | null> {
  if (!result.webPath) return null;
  const blob = await (await fetch(result.webPath)).blob();
  const format = result.metadata?.format ?? blob.type.split('/')[1] ?? 'jpeg';
  return new File([blob], `imagen.${format}`, { type: blob.type || `image/${format}` });
}

function isCancel(error: unknown): boolean {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  return (!!code && CANCEL_CODES.includes(code)) || /cancel/i.test(message ?? '');
}
