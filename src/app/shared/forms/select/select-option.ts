export interface SelectOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Convierte cualquier lista en opciones para app-select:
 *   toOptions(countries, (c) => c.id, (c) => c.name)
 */
export function toOptions<TItem, TValue>(
  items: readonly TItem[],
  valueOf: (item: TItem) => TValue,
  labelOf: (item: TItem) => string,
): SelectOption<TValue>[] {
  return items.map((item) => ({ value: valueOf(item), label: labelOf(item) }));
}
