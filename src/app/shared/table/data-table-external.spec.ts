import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTable } from './data-table';
import { TableConfig } from './table-config';

interface Member {
  id: number;
  name: string;
  founder: boolean;
}

@Component({
  imports: [DataTable],
  template: `
    <app-table
      [config]="config"
      [rows]="rows"
      (add)="events.push('add')"
      (edit)="events.push('edit:' + $event.name)"
      (delete)="events.push('delete:' + $event.name)"
    />
  `,
})
class Host {
  readonly config: TableConfig<Member> = {
    columns: [{ header: 'Nombre', field: 'name' }],
    actions: { add: true, edit: true, delete: true },
    canDelete: (member) => !member.founder, // los fundadores no se pueden eliminar
  };
  readonly rows: Member[] = [
    { id: 1, name: 'Ana', founder: true },
    { id: 2, name: 'Luis', founder: false },
  ];
  readonly events: string[] = [];
}

/**
 * Dónde está la acción: al deslizar (teléfono) o como botón visible (pantalla ancha).
 * Se busca por clase: ion-button mueve aria-label a su botón interno (shadow DOM).
 */
type Layout = 'swipe' | 'wide';

const SELECTORS: Record<Layout, string> = {
  swipe: 'ion-item-option',
  wide: 'ion-buttons ion-button',
};

describe('DataTable (external mode)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const action = (row: number, kind: 'edit' | 'delete', layout: Layout = 'swipe') =>
      element
        .querySelectorAll('ion-item-sliding')
        [row].querySelector<HTMLElement>(`${SELECTORS[layout]}.${kind}`);
    return { element, host: fixture.componentInstance, action };
  }

  it('emits events and leaves the rows untouched', async () => {
    const { element, host, action } = await setup();

    element.querySelector<HTMLElement>('ion-button.add')?.click();
    action(0, 'edit')?.click();
    action(1, 'delete', 'wide')?.click();

    expect(host.events).toEqual(['add', 'edit:Ana', 'delete:Luis']);
    expect(host.rows.length).toBe(2);
  });

  it('hides actions for protected rows in both layouts', async () => {
    const { action } = await setup();
    expect(action(0, 'delete')).toBeNull();
    expect(action(0, 'delete', 'wide')).toBeNull();
    expect(action(1, 'delete')).not.toBeNull();
  });
});
