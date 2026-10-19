import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { DialogService } from '@core/dialog/dialog.service';
import { TablePage } from './table-page';

describe('TablePage', () => {
  const dialogs = { confirm: vi.fn(), info: vi.fn() };

  async function setup() {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideIonicAngular(), { provide: DialogService, useValue: dialogs }],
    });
    const fixture = TestBed.createComponent(TablePage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const rows = (table: number) =>
      Array.from(element.querySelectorAll('app-table'))[table].querySelectorAll('ion-item-sliding');
    return { fixture, page: fixture.componentInstance, element, rows };
  }

  it('does not offer to delete the owner', async () => {
    const { rows } = await setup();
    const owner = rows(0)[0];
    expect(owner.textContent).toContain('Ana Torres');
    expect(owner.querySelector('.delete')).toBeNull();
    expect(rows(0)[1].querySelector('.delete')).not.toBeNull();
  });

  it('removes a product only after the user confirms', async () => {
    const { fixture, page, rows } = await setup();
    const keyboard = { id: 1, name: 'Teclado', price: 35.5, active: true };

    dialogs.confirm.mockResolvedValue(false);
    await page.onProductDelete(keyboard);
    await fixture.whenStable();
    expect(rows(1).length).toBe(3);

    dialogs.confirm.mockResolvedValue(true);
    await page.onProductDelete(keyboard);
    await fixture.whenStable();
    expect(rows(1).length).toBe(2);
  });

  it('submits the team with its members', async () => {
    const { fixture, element } = await setup();
    Array.from(element.querySelectorAll('ion-button'))
      .find((b) => b.textContent?.includes('Guardar equipo'))
      ?.click();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    const json = element.querySelector('pre')?.textContent ?? '';
    expect(json).toContain('"team": "Equipo Alfa"');
    expect(json).toContain('"name": "Luis Pérez"');
  });
});
