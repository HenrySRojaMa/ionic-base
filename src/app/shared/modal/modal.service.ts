import { Service, Type, inject } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalInteraction } from './modal-interaction';

export interface ModalOptions {
  /**
   * Hoja inferior (bottom sheet), natural en móviles: se abre a la altura indicada
   * (0 a 1) y el usuario puede arrastrarla.
   */
  sheet?: { initial: number; breakpoints?: number[] };
}

/**
 * Abre cualquier componente que extienda ModalInteraction en un modal de Ionic y
 * devuelve una Promise con su resultado (null si se canceló, se deslizó para
 * cerrar o se tocó el fondo):
 *
 *   const user = await this.modal.open(SearchUser, { term: 'ana' });
 *
 * Mismo API que ModalService en las bases web: las features no cambian.
 */
@Service()
export class ModalService {
  private readonly modals = inject(ModalController);

  async open<TData, TResult>(
    component: Type<ModalInteraction<TData, TResult>>,
    data: TData,
    options: ModalOptions = {},
  ): Promise<TResult | null> {
    const modal = await this.modals.create({
      component,
      componentProps: { data },
      ...(options.sheet && {
        initialBreakpoint: options.sheet.initial,
        breakpoints: options.sheet.breakpoints ?? [0, options.sheet.initial, 1],
      }),
    });
    await modal.present();

    const { data: result, role } = await modal.onWillDismiss<TResult>();
    return role === 'confirm' ? (result ?? null) : null;
  }
}
