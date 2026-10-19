import { TestBed } from '@angular/core/testing';
import { AlertController, ToastController } from '@ionic/angular';
import { DialogService } from './dialog.service';

/** Se simulan los controladores de Ionic: se prueba qué se les pide y cómo se lee la respuesta. */
describe('DialogService', () => {
  function overlay(role?: string) {
    return {
      present: vi.fn().mockResolvedValue(undefined),
      onDidDismiss: vi.fn().mockResolvedValue({ role }),
    };
  }

  function setup(role?: string) {
    const alert = overlay(role);
    const toast = overlay();
    const alerts = { create: vi.fn().mockResolvedValue(alert) };
    const toasts = { create: vi.fn().mockResolvedValue(toast) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AlertController, useValue: alerts },
        { provide: ToastController, useValue: toasts },
      ],
    });
    return { dialogs: TestBed.inject(DialogService), alerts, toasts, toast };
  }

  it('shows success as a self-dismissing toast', async () => {
    const { dialogs, toasts, toast, alerts } = setup();

    await dialogs.success('Guardado');

    expect(toasts.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Guardado', color: 'success', duration: 2500 }),
    );
    expect(toast.present).toHaveBeenCalled();
    expect(alerts.create).not.toHaveBeenCalled();
  });

  it('shows errors as an alert with a single button', async () => {
    const { dialogs, alerts } = setup();

    await dialogs.error('No se pudo guardar');

    expect(alerts.create).toHaveBeenCalledWith({
      header: 'Ocurrió un error',
      message: 'No se pudo guardar',
      buttons: ['Aceptar'],
    });
  });

  it('confirm resolves true only when the user accepts', async () => {
    await expect(setup('confirm').dialogs.confirm('¿Eliminar?')).resolves.toBe(true);
    TestBed.resetTestingModule();
    await expect(setup('cancel').dialogs.confirm('¿Eliminar?')).resolves.toBe(false);
    TestBed.resetTestingModule();
    await expect(setup('backdrop').dialogs.confirm('¿Eliminar?')).resolves.toBe(false);
  });
});
