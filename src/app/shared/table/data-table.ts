import { Component, computed, input, output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline } from 'ionicons/icons';
import { BaseControl } from '../forms/base-control';
import { ControlLabel } from '../forms/control-label/control-label';
import { TableConfig, TableRowView, buildRowViews } from './table-config';

/**
 * Tabla genérica configurable, dibujada como lista de Ionic.
 *
 * Modo EXTERNO: no modifica los datos; emite (add), (edit), (delete).
 *   <app-table [config]="usersTable" [rows]="users()" (delete)="remove($event)" />
 *
 * Acciones de cada fila, según el tamaño de pantalla:
 * - Teléfono: deslizar el elemento a la izquierda (ion-item-sliding), el gesto
 *   que el usuario móvil espera. Los botones no ocupan espacio.
 * - Pantalla ancha (lg): botones visibles al final, porque con mouse nadie
 *   adivina que hay que arrastrar.
 * Ambos llaman a los mismos métodos.
 */
@Component({
  selector: 'app-table',
  imports: [
    IonList,
    IonListHeader,
    IonItem,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLabel,
    IonButtons,
    IonButton,
    IonIcon,
    IonNote,
    ControlLabel,
  ],
  templateUrl: './data-table.html',
})
export class DataTable<T> extends BaseControl<T[]> {
  readonly config = input<TableConfig<T>>({ columns: [] });
  readonly rows = input<readonly T[] | null>([]);

  readonly add = output<void>();
  readonly edit = output<T>();
  readonly delete = output<T>();

  protected readonly list = computed<readonly T[]>(() => this.rows() ?? []);
  protected readonly views = computed(() => buildRowViews(this.list(), this.config()));
  protected readonly showAdd = computed(() => !this.disabled() && !!this.config().actions?.add);
  protected readonly showRowActions = computed(() => !this.disabled());

  constructor() {
    super();
    addIcons({ addOutline, createOutline, trashOutline });
  }

  protected onAdd(): void {
    this.add.emit();
  }

  protected onEdit(view: TableRowView<T>, sliding?: IonItemSliding): void {
    void sliding?.close();
    this.edit.emit(view.row);
  }

  protected onDelete(view: TableRowView<T>, sliding?: IonItemSliding): void {
    void sliding?.close();
    this.delete.emit(view.row);
  }

  protected trackRow(row: T): unknown {
    const trackBy = this.config().trackBy;
    return trackBy ? trackBy(row) : row;
  }
}
