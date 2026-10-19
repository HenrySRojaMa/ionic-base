import { Directive, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * Contrato que cumple todo componente que se abre en un modal de Ionic.
 *
 * - data():  lo que recibe al abrirse (ModalService.open(Componente, data)).
 * - close(): devuelve un resultado y cierra el modal.
 *
 * Mismo contrato que en las bases web, pero el modal lo provee Ionic
 * (ModalController): animaciones, gesto de deslizar para cerrar, estilo iOS o
 * Android y "sheet" (hoja inferior) en móviles. No hace falta un host propio.
 *
 * Para que data (un input con signals) reciba el valor, la app debe configurar
 * provideIonicAngular({ useSetInputAPI: true }); ver app.config.ts.
 */
@Directive()
export abstract class ModalInteraction<TData = void, TResult = void> {
  readonly data = input.required<TData>();
  private readonly modal = inject(ModalController);

  close(result: TResult | null = null): void {
    void this.modal.dismiss(result, result === null ? 'cancel' : 'confirm');
  }
}
