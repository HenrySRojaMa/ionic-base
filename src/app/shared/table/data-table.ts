import { Component, computed, inject, input, output } from '@angular/core';
import {
  AlertController,
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
import { ModalService } from '../modal/modal.service';
import { TableConfig, TableRowView, buildRowViews } from './table-config';

export type TableMode = 'internal' | 'external';

/**
 * Tabla genérica configurable con dos modos, dibujada como lista de Ionic.
 *
 * EXTERNO (por defecto): no modifica los datos; emite (add), (edit), (delete).
 *   <app-table [config]="usersTable" [rows]="users()" (delete)="remove($event)" />
 *
 * INTERNO: es un control de formulario cuyo valor es el arreglo de filas.
 * Agrega/edita con config.editor (un modal de Ionic) y elimina con confirmación.
 *   <app-table mode="internal" label="Integrantes" [config]="membersTable"
 *              [formField]="f.members" />
 *   (o sin formulario: [(value)]="members")
 *
 * Acciones de cada fila, según el tamaño de pantalla:
 * - Teléfono: deslizar el elemento a la izquierda (ion-item-sliding), el gesto
 *   que el usuario móvil espera. Los botones no ocupan espacio.
 * - Pantalla ancha (lg): botones visibles al final, porque con mouse nadie
 *   adivina que hay que arrastrar.
 * Ambos llaman a los mismos métodos.
 *
 * Cada cambio produce un arreglo NUEVO; la fila original nunca se modifica.
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
  readonly mode = input<TableMode>('external');
  /** Filas en modo externo (en modo interno vienen de value()). */
  readonly rows = input<readonly T[] | null>([]);

  readonly add = output<void>();
  readonly edit = output<T>();
  readonly delete = output<T>();

  private readonly modal = inject(ModalService);
  private readonly alerts = inject(AlertController);

  /** La lista visible se DERIVA según el modo: sin efectos secundarios. */
  protected readonly list = computed<readonly T[]>(() =>
    this.mode() === 'external' ? (this.rows() ?? []) : (this.value() ?? []),
  );

  /** En modo interno sin editor no se puede agregar ni editar. */
  private readonly effectiveConfig = computed<TableConfig<T>>(() => {
    const config = this.config();
    return this.mode() === 'internal' && !config.editor
      ? { ...config, actions: { ...config.actions, add: false, edit: false } }
      : config;
  });

  protected readonly views = computed(() => buildRowViews(this.list(), this.effectiveConfig()));
  protected readonly showAdd = computed(
    () => !this.disabled() && !!this.effectiveConfig().actions?.add,
  );
  protected readonly showRowActions = computed(() => !this.disabled());

  constructor() {
    super();
    addIcons({ addOutline, createOutline, trashOutline });
  }

  protected async onAdd(): Promise<void> {
    if (this.mode() === 'external') return this.add.emit();

    const created = await this.openEditor(null);
    if (created !== null) this.commit([...this.list(), created]);
  }

  protected async onEdit(view: TableRowView<T>, sliding?: IonItemSliding): Promise<void> {
    void sliding?.close();
    if (this.mode() === 'external') return this.edit.emit(view.row);

    const edited = await this.openEditor(copyOf(view.row));
    if (edited !== null) {
      this.commit(this.list().map((row, index) => (index === view.index ? edited : row)));
    }
  }

  protected async onDelete(view: TableRowView<T>, sliding?: IonItemSliding): Promise<void> {
    void sliding?.close();
    if (this.mode() === 'external') return this.delete.emit(view.row);

    const message = this.config().confirmDelete;
    if (message && !(await this.confirm(message))) return;
    this.commit(this.list().filter((_row, index) => index !== view.index));
  }

  protected trackRow(row: T): unknown {
    const trackBy = this.config().trackBy;
    return trackBy ? trackBy(row) : row;
  }

  /** Entrega el arreglo nuevo: [formField] lo lleva al campo. */
  private commit(rows: T[]): void {
    this.value.set(rows);
    this.markAsTouched();
  }

  private openEditor(row: T | null): Promise<T | null> {
    const editor = this.config().editor;
    if (!editor) return Promise.resolve(null);
    return this.modal.open(editor, row, this.config().editorOptions);
  }

  /** Confirmación nativa de Ionic (shared no puede usar el DialogService de core). */
  private async confirm(message: string): Promise<boolean> {
    const alert = await this.alerts.create({
      header: 'Confirmar',
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}

/** Copia superficial: el editor trabaja sobre una copia y la fila original no cambia. */
function copyOf<T>(row: T): T {
  return row !== null && typeof row === 'object' ? { ...row } : row;
}
