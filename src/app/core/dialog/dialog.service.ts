import { Service, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

const TOAST_DURATION_MS = 2500;

/**
 * Diálogos de la aplicación sobre los overlays nativos de Ionic. Mismo API que
 * en las bases web, para que las features no cambien:
 *
 * - success(): TOAST (aviso breve que desaparece solo). En un teléfono, un alert
 *   con "Aceptar" para cada éxito interrumpe demasiado.
 * - error(), warning(), info(): ALERT (requiere que el usuario lo lea).
 * - confirm(): ALERT con dos botones; true solo si el usuario aceptó.
 *
 * Los overlays usan el estilo de cada plataforma (iOS o Material) automáticamente.
 */
@Service()
export class DialogService {
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);

  async success(message: string): Promise<void> {
    const toast = await this.toasts.create({
      message,
      color: 'success',
      duration: TOAST_DURATION_MS,
      position: 'bottom',
    });
    await toast.present();
  }

  error(message: string, title = 'Ocurrió un error'): Promise<void> {
    return this.alert(title, message);
  }

  warning(message: string, title = 'Atención'): Promise<void> {
    return this.alert(title, message);
  }

  info(message: string, title = 'Información'): Promise<void> {
    return this.alert(title, message);
  }

  async confirm(
    message: string,
    title = '¿Estás seguro?',
    acceptText = 'Aceptar',
    cancelText = 'Cancelar',
  ): Promise<boolean> {
    const alert = await this.alerts.create({
      header: title,
      message,
      buttons: [
        { text: cancelText, role: 'cancel' },
        { text: acceptText, role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  private async alert(header: string, message: string): Promise<void> {
    const alert = await this.alerts.create({ header, message, buttons: ['Aceptar'] });
    await alert.present();
    await alert.onDidDismiss();
  }
}
