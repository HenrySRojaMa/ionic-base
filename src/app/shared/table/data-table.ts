import { Component, computed, input } from '@angular/core';
import { IonItem, IonLabel, IonList, IonNote } from '@ionic/angular';
import { BaseControl } from '../forms/base-control';
import { ControlLabel } from '../forms/control-label/control-label';
import { TableConfig, buildRowViews } from './table-config';

/**
 * Tabla genérica configurable, dibujada como lista de Ionic.
 *
 *   <app-table [config]="usersTable" [rows]="users()" />
 *
 * Cada fila es un ion-item: la primera columna es el título y las demás van
 * debajo como "Encabezado: valor". Es la forma natural de mostrar registros en
 * un teléfono; la configuración es la misma que en las bases web.
 */
@Component({
  selector: 'app-table',
  imports: [IonList, IonItem, IonLabel, IonNote, ControlLabel],
  templateUrl: './data-table.html',
})
export class DataTable<T> extends BaseControl<T[]> {
  readonly config = input<TableConfig<T>>({ columns: [] });
  readonly rows = input<readonly T[] | null>([]);

  protected readonly list = computed<readonly T[]>(() => this.rows() ?? []);
  protected readonly views = computed(() => buildRowViews(this.list(), this.config()));

  protected trackRow(row: T): unknown {
    const trackBy = this.config().trackBy;
    return trackBy ? trackBy(row) : row;
  }
}
