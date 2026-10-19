import { Signal, computed } from '@angular/core';

/**
 * Lista hija de un select en cascada, DERIVADA del valor del campo padre:
 *
 *   states = cascadeChildren(countries, () => this.model().country, (c) => c.id, (c) => c.states);
 *   cities = cascadeChildren(states,    () => this.model().state,   (s) => s.id, (s) => s.cities);
 *
 * Legacy necesitaba RxJS: controlValue() (valueChanges + startWith +
 * distinctUntilChanged), combineLatest y shareReplay. Aquí basta un computed():
 * los valores del formulario y el catálogo ya son signals, y computed se
 * recalcula solo cuando alguno cambia (y comparte el resultado entre lectores).
 *
 * Funciona igual si elige el usuario, si se cargan datos para editar o si el
 * catálogo llega después. Limpiar los hijos sigue siendo responsabilidad de la
 * página, y solo ante una elección del usuario ((valueChange) del select padre).
 */
export function cascadeChildren<TItem, TKey>(
  parentItems: () => readonly TItem[],
  parentKey: () => TKey | null | undefined,
  keyOf: (item: TItem) => TKey,
  childrenOf: (item: TItem) => readonly TItem[] | null | undefined,
): Signal<TItem[]> {
  return computed(() => {
    const key = parentKey();
    const parent = parentItems().find((item) => keyOf(item) === key);
    return parent ? [...(childrenOf(parent) ?? [])] : [];
  });
}
