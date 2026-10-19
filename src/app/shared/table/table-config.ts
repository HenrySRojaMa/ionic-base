import { Type } from '@angular/core';
import { ModalInteraction } from '../modal/modal-interaction';
import { ModalOptions } from '../modal/modal.service';

export interface TableColumn<T> {
  header: string;
  /** Propiedad de la fila a mostrar. Tipada: un nombre mal escrito no compila. */
  field?: keyof T & string;
  /** O un valor calculado a partir de la fila (tiene prioridad sobre field). */
  value?: (row: T) => unknown;
}

/**
 * Configuración de una tabla. La MISMA forma que en las bases web: se define en
 * el .ts de la página y el HTML queda en una línea.
 *
 * En Ionic la tabla se dibuja como lista (una tabla de varias columnas no cabe
 * en un teléfono): la PRIMERA columna es el título de cada elemento y las demás
 * se muestran debajo como "Encabezado: valor".
 */
export interface TableConfig<T> {
  columns: TableColumn<T>[];
  /** Identidad de una fila (por defecto, la referencia del objeto). */
  trackBy?: (row: T) => unknown;
  emptyMessage?: string;
  /** Acciones visibles. */
  actions?: { add?: boolean; edit?: boolean; delete?: boolean };
  /** Filas protegidas: si devuelve false, la acción no se muestra para esa fila. */
  canEdit?: (row: T) => boolean;
  canDelete?: (row: T) => boolean;
  addLabel?: string;

  // ---- Solo modo interno ----
  /**
   * Componente que se abre en un modal para crear (recibe null) o editar
   * (recibe una COPIA de la fila) y devuelve la fila resultante.
   */
  editor?: Type<ModalInteraction<T | null, T>>;
  /** Opciones del modal del editor (por ejemplo, como hoja inferior). */
  editorOptions?: ModalOptions;
  /** Si se define, se pide confirmación antes de eliminar con este mensaje. */
  confirmDelete?: string;
}

/** Una fila ya preparada para pintar: se calcula una vez, no en cada ciclo. */
export interface TableRowView<T> {
  row: T;
  index: number;
  /** Primera columna: el título del elemento. */
  title: string;
  /** Resto de columnas con su encabezado. Las vacías se omiten. */
  details: { header: string; value: string }[];
  canEdit: boolean;
  canDelete: boolean;
}

export function buildRowViews<T>(rows: readonly T[], config: TableConfig<T>): TableRowView<T>[] {
  const [first, ...rest] = config.columns;
  return rows.map((row, index) => ({
    row,
    index,
    title: first ? formatCell(cellValue(row, first)) : '',
    details: rest
      .map((column) => ({ header: column.header, value: formatCell(cellValue(row, column)) }))
      .filter((detail) => detail.value !== ''),
    canEdit: !!config.actions?.edit && (config.canEdit?.(row) ?? true),
    canDelete: !!config.actions?.delete && (config.canDelete?.(row) ?? true),
  }));
}

function cellValue<T>(row: T, column: TableColumn<T>): unknown {
  if (column.value) return column.value(row);
  return column.field ? row[column.field] : null;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}
