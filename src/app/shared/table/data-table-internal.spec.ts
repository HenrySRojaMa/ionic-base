import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { AlertController } from '@ionic/angular';
import { minItems } from '../forms/app-validators';
import { ModalInteraction } from '../modal/modal-interaction';
import { ModalService } from '../modal/modal.service';
import { DataTable } from './data-table';
import { TableConfig } from './table-config';

interface Member {
  id: number;
  name: string;
}

/** Editor de ejemplo: no se abre de verdad, ModalService es un falso. */
@Component({ selector: 'app-member-editor', template: '' })
class MemberEditor extends ModalInteraction<Member | null, Member> {}

@Component({
  imports: [FormField, DataTable],
  template: `
    <app-table mode="internal" label="Integrantes" [config]="config" [formField]="f.members" />
  `,
})
class Host {
  readonly config: TableConfig<Member> = {
    columns: [{ header: 'Nombre', field: 'name' }],
    actions: { add: true, edit: true, delete: true },
    editor: MemberEditor,
    editorOptions: { sheet: { initial: 0.75 } },
    confirmDelete: '¿Eliminar al integrante?',
  };
  readonly original: Member[] = [{ id: 1, name: 'Ana' }];
  readonly model = signal({ members: this.original });
  readonly f = form(this.model, (p) => minItems(p.members, 1));
}

describe('DataTable (internal mode)', () => {
  /** Lo que "devuelve el editor": recibe la fila (o null) y responde. */
  let editorResult: (row: Member | null) => Member | null;
  let alertRole: string;
  const modal = { open: vi.fn(async (_c: unknown, row: Member | null) => editorResult(row)) };
  const alerts = {
    create: vi.fn(async () => ({
      present: vi.fn(),
      onDidDismiss: vi.fn(async () => ({ role: alertRole })),
    })),
  };

  /** Deja correr las promesas pendientes (modal -> resultado -> tabla). */
  const settle = () => new Promise((resolve) => setTimeout(resolve));

  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalService, useValue: modal },
        { provide: AlertController, useValue: alerts },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const click = (selector: string) => element.querySelector<HTMLElement>(selector)?.click();
    return { fixture, host: fixture.componentInstance, click };
  }

  it('adds the row returned by the editor as a NEW array', async () => {
    const { host, click } = await setup();
    editorResult = () => ({ id: 99, name: 'Nuevo' });

    click('ion-button.add');
    await settle();

    expect(modal.open).toHaveBeenCalledWith(MemberEditor, null, { sheet: { initial: 0.75 } });
    expect(host.model().members.map((m) => m.name)).toEqual(['Ana', 'Nuevo']);
    expect(host.model().members).not.toBe(host.original);
    expect(host.original.length).toBe(1);
  });

  it('edits a copy and replaces only that row', async () => {
    const { host, click } = await setup();
    editorResult = (row) => {
      expect(row).not.toBe(host.original[0]); // el editor recibe una COPIA
      return { ...row!, name: 'Ana (editado)' };
    };

    click('ion-item-option.edit');
    await settle();

    expect(host.model().members[0].name).toBe('Ana (editado)');
    expect(host.original[0].name).toBe('Ana');
  });

  it('keeps the rows when the editor is cancelled', async () => {
    const { host, click } = await setup();
    editorResult = () => null;

    click('ion-button.add');
    await settle();

    expect(host.model().members).toBe(host.original);
  });

  it('asks for confirmation before deleting and validates the minimum', async () => {
    const { fixture, host, click } = await setup();
    alertRole = 'confirm';

    click('ion-item-option.delete');
    await settle();
    await fixture.whenStable();

    expect(alerts.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: '¿Eliminar al integrante?' }),
    );
    expect(host.model().members).toEqual([]);
    expect(host.f.members().errors()[0]?.kind).toBe('minItems');
    expect(fixture.nativeElement.textContent).toContain('Debe agregar al menos un elemento.');
  });

  it('keeps the rows when the deletion is cancelled', async () => {
    const { host, click } = await setup();
    alertRole = 'cancel';

    click('ion-item-option.delete');
    await settle();

    expect(host.model().members.length).toBe(1);
  });
});
