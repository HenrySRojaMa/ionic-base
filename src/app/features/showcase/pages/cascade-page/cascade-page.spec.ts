import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '@env/environment';
import { Place } from '@domain/place/place.models';
import { CascadePage } from './cascade-page';

const PLACES: Place[] = [
  {
    id: 1,
    name: 'Ecuador',
    children: [
      { id: 11, name: 'Guayas', children: [{ id: 111, name: 'Guayaquil' }] },
      { id: 12, name: 'Pichincha', children: [{ id: 121, name: 'Quito' }] },
    ],
  },
  { id: 2, name: 'Perú', children: [{ id: 21, name: 'Lima', children: [] }] },
];

type IonSelectElement = HTMLElement & { value: unknown };

describe('CascadePage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideIonicAngular(), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(CascadePage);
    // Una petición pendiente mantiene la app "inestable": se responde antes de whenStable().
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}demo/places`)
      .flush({ code: 'OK', message: '', data: PLACES });
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const selects = () => Array.from(element.querySelectorAll<IonSelectElement>('ion-select'));
    const optionLabels = (index: number) =>
      Array.from(selects()[index].querySelectorAll('ion-select-option')).map((o) =>
        o.textContent?.trim(),
      );
    const click = async (text: string) => {
      Array.from(element.querySelectorAll('ion-button'))
        .find((b) => b.textContent?.includes(text))
        ?.click();
      await fixture.whenStable();
    };
    return { fixture, selects, optionLabels, click };
  }

  it('loads a saved address and fills the three levels', async () => {
    const { selects, optionLabels, click } = await setup();

    await click('Cargar dirección guardada');

    expect(selects().map((s) => s.value)).toEqual([1, 12, 121]);
    expect(optionLabels(2)).toEqual(['Quito']);
  });

  it('clears the children only when the user changes the country', async () => {
    const { fixture, selects, optionLabels, click } = await setup();
    await click('Cargar dirección guardada');

    selects()[0].dispatchEvent(new CustomEvent('ionChange', { detail: { value: 2 } }));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('code').textContent).toContain('"state": null');
    expect(optionLabels(1)).toEqual(['Lima']);
  });
});
