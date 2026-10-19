import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { DataTable } from './data-table';
import { TableConfig } from './table-config';

interface Person {
  id: number;
  name: string;
  active: boolean;
  email: string | null;
}

@Component({
  imports: [DataTable],
  template: `<app-table [config]="config" [rows]="rows()" />`,
})
class Host {
  readonly config: TableConfig<Person> = {
    columns: [
      { header: 'Nombre', field: 'name' },
      { header: 'Activo', field: 'active' },
      { header: 'Correo', field: 'email' },
      { header: 'Código', value: (p) => `P-${p.id}` },
    ],
    trackBy: (p) => p.id,
    emptyMessage: 'Sin personas',
  };
  readonly rows = signal<Person[]>([
    { id: 1, name: 'Ana', active: true, email: 'ana@mail.com' },
    { id: 2, name: 'Luis', active: false, email: null },
  ]);
}

describe('DataTable (Ionic list)', () => {
  async function setup() {
    // La tabla inyecta ModalController y AlertController: los registra provideIonicAngular().
    TestBed.configureTestingModule({ providers: [provideIonicAngular()] });
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    return { fixture, host: fixture.componentInstance };
  }

  /** Cada fila: [título, ...detalles]. */
  const items = (element: HTMLElement) =>
    Array.from(element.querySelectorAll('ion-item')).map((item) =>
      Array.from(item.querySelectorAll('h2, p')).map((line) => line.textContent?.trim()),
    );

  it('uses the first column as title and the rest as details', async () => {
    const { fixture } = await setup();
    expect(items(fixture.nativeElement)).toEqual([
      ['Ana', 'Activo: Sí', 'Correo: ana@mail.com', 'Código: P-1'],
      ['Luis', 'Activo: No', 'Código: P-2'], // el correo vacío no se muestra
    ]);
  });

  it('shows the empty message (@empty block)', async () => {
    const { fixture, host } = await setup();
    host.rows.set([]);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Sin personas');
  });

  it('replaces the rows instead of accumulating them', async () => {
    const { fixture, host } = await setup();
    host.rows.set([{ id: 3, name: 'Eva', active: true, email: null }]);
    await fixture.whenStable();
    expect(items(fixture.nativeElement)).toEqual([['Eva', 'Activo: Sí', 'Código: P-3']]);
  });
});
