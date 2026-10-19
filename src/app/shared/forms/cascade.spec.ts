import { signal } from '@angular/core';
import { cascadeChildren } from './cascade';

interface Place {
  id: number;
  name: string;
  children?: Place[];
}

const TREE: Place[] = [
  {
    id: 1,
    name: 'Ecuador',
    children: [
      { id: 10, name: 'Guayas', children: [{ id: 100, name: 'Guayaquil' }] },
      { id: 11, name: 'Pichincha', children: [{ id: 110, name: 'Quito' }] },
    ],
  },
  { id: 2, name: 'Perú', children: [{ id: 20, name: 'Lima', children: [] }] },
];

describe('cascadeChildren', () => {
  function setup(initial: Place[] = TREE) {
    const catalog = signal<Place[]>(initial);
    const model = signal({
      country: null as number | null,
      state: null as number | null,
      city: null as number | null,
    });
    const states = cascadeChildren(
      catalog,
      () => model().country,
      (p) => p.id,
      (p) => p.children,
    );
    const cities = cascadeChildren(
      states,
      () => model().state,
      (p) => p.id,
      (p) => p.children,
    );
    const names = (list: () => Place[]) => list().map((p) => p.name);
    return { catalog, model, states: () => names(states), cities: () => names(cities) };
  }

  it('derives each level from the value of the previous one', () => {
    const { model, states, cities } = setup();
    expect(states()).toEqual([]);

    model.update((m) => ({ ...m, country: 1 }));
    expect(states()).toEqual(['Guayas', 'Pichincha']);

    model.update((m) => ({ ...m, state: 11 }));
    expect(cities()).toEqual(['Quito']);
  });

  it('works when the whole form is loaded at once (edit mode)', () => {
    const { model, states, cities } = setup();

    model.set({ country: 1, state: 10, city: 100 });

    expect(states()).toEqual(['Guayas', 'Pichincha']);
    expect(cities()).toEqual(['Guayaquil']);
    expect(model()).toEqual({ country: 1, state: 10, city: 100 }); // nada se borra
  });

  it('works when the catalog arrives after the values', () => {
    const { catalog, model, cities } = setup([]);
    model.set({ country: 1, state: 11, city: null });
    expect(cities()).toEqual([]);

    catalog.set(TREE); // llega el catálogo

    expect(cities()).toEqual(['Quito']);
    expect(model().state).toBe(11);
  });
});
