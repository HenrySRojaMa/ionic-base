import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { ModalInteraction } from './modal-interaction';
import { ModalService } from './modal.service';

@Component({ selector: 'app-test-modal', template: '' })
class TestModal extends ModalInteraction<string, string> {}

/**
 * Se prueba NUESTRA lógica (qué se le pide a Ionic y cómo se interpreta la
 * respuesta), simulando ModalController: los overlays de Ionic necesitan un
 * navegador real con animaciones, que jsdom no tiene.
 */
describe('ModalService', () => {
  function setup(dismissal: { data?: unknown; role?: string }) {
    const modal = {
      present: vi.fn().mockResolvedValue(undefined),
      onWillDismiss: vi.fn().mockResolvedValue(dismissal),
    };
    const controller = { create: vi.fn().mockResolvedValue(modal) };
    TestBed.configureTestingModule({
      providers: [{ provide: ModalController, useValue: controller }],
    });
    return { service: TestBed.inject(ModalService), controller, modal };
  }

  it('passes the data as an input and returns the confirmed result', async () => {
    const { service, controller, modal } = setup({ data: 'ok', role: 'confirm' });

    await expect(service.open(TestModal, 'Ana')).resolves.toBe('ok');
    expect(controller.create).toHaveBeenCalledWith({
      component: TestModal,
      componentProps: { data: 'Ana' },
    });
    expect(modal.present).toHaveBeenCalled();
  });

  it('returns null when dismissed by gesture or backdrop', async () => {
    const { service } = setup({ data: undefined, role: 'backdrop' });
    await expect(service.open(TestModal, 'Ana')).resolves.toBeNull();
  });

  it('opens as a bottom sheet when requested', async () => {
    const { service, controller } = setup({ role: 'cancel' });

    await service.open(TestModal, 'Ana', { sheet: { initial: 0.5 } });

    expect(controller.create).toHaveBeenCalledWith(
      expect.objectContaining({ initialBreakpoint: 0.5, breakpoints: [0, 0.5, 1] }),
    );
  });
});
