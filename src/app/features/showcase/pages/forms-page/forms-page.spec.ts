import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { IMAGE_PICKER } from '@shared/forms/image-file/image-picker';
import { FormsPage } from './forms-page';

type IonFieldElement = HTMLElement & { value: unknown; errorText: string };

describe('FormsPage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideIonicAngular(),
        { provide: IMAGE_PICKER, useValue: { pickImage: async () => null } },
      ],
    });
    const fixture = TestBed.createComponent(FormsPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const click = async (text: string) => {
      Array.from(element.querySelectorAll('ion-button'))
        .find((b) => b.textContent?.includes(text))
        ?.click();
      await new Promise((resolve) => setTimeout(resolve)); // submit() es asíncrono
      await fixture.whenStable();
    };
    const fieldValues = () =>
      Array.from(element.querySelectorAll<IonFieldElement>('ion-input, ion-select')).map(
        (field) => field.value,
      );
    return { element, click, fieldValues };
  }

  it('loads an example with arrays of any size (edit mode)', async () => {
    const { click, fieldValues } = await setup();

    await click('Cargar ejemplo');

    expect(fieldValues()).toContain('042123456');
    expect(fieldValues()).toContain('Carla Ruiz');
    expect(fieldValues()).toContain('work'); // ion-select recibe el valor tal cual
  });

  it('shows the errors instead of submitting an invalid form', async () => {
    const { element, click } = await setup();

    await click('Enviar');

    expect(element.querySelector('pre')).toBeNull();
    const errors = Array.from(element.querySelectorAll<IonFieldElement>('ion-input')).map(
      (input) => input.errorText,
    );
    expect(errors).toContain('Este campo es obligatorio.');
  });

  it('submits the whole model, arrays included', async () => {
    const { element, click } = await setup();
    await click('Cargar ejemplo');

    await click('Enviar');

    const json = element.querySelector('pre')?.textContent ?? '';
    expect(json).toContain('"0991234567"');
    expect(json).toContain('"relation": "work"');
  });

  it('adds and removes array items by updating the model', async () => {
    const { element, click } = await setup();

    await click('Teléfono');
    expect(element.textContent).toContain('Teléfono 2');

    await click('Referencia');
    expect(element.textContent).not.toContain('Sin referencias.');
  });
});
