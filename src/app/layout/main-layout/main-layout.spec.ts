import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { StorageService } from '@core/platform/storage.service';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  it('renders the side menu items inside a split pane', async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular(), provideRouter([])] });
    const fixture = TestBed.createComponent(MainLayout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('ion-split-pane ion-menu')).not.toBeNull();
    expect(element.querySelector('ion-menu ion-item')?.textContent).toContain('Inicio');
    expect(element.querySelector('ion-router-outlet#main-content')).not.toBeNull();
  });

  it('collapses and pins the menu from its header button', async () => {
    TestBed.configureTestingModule({ providers: [provideIonicAngular(), provideRouter([])] });
    const fixture = TestBed.createComponent(MainLayout);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const pane = () =>
      element.querySelector('ion-split-pane') as HTMLElement & { disabled: boolean };
    const pin = () => element.querySelector<HTMLElement>('ion-button.menu-pin');

    expect(pane().disabled).toBe(false);

    pin()?.click();
    await fixture.whenStable();
    expect(pane().disabled).toBe(true); // contraído: el contenido usa todo el ancho

    pin()?.click();
    await vi.waitFor(() => expect(pane().disabled).toBe(false));
    await TestBed.inject(StorageService).remove('app.menu-pinned');
  });
});
