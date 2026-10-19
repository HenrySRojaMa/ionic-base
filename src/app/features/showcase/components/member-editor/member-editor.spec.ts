import { TestBed } from '@angular/core/testing';
import { ModalController, provideIonicAngular } from '@ionic/angular';
import { Member } from '../../models/showcase.models';
import { MemberEditor } from './member-editor';

type IonFieldElement = HTMLElement & { value: string; errorText: string };

describe('MemberEditor', () => {
  /** close() entrega el resultado a ModalController.dismiss: se espía ahí. */
  const modals = { dismiss: vi.fn() };

  async function setup(data: Member | null) {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideIonicAngular(), { provide: ModalController, useValue: modals }],
    });
    const fixture = TestBed.createComponent(MemberEditor);
    fixture.componentRef.setInput('data', data);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const submit = async () => {
      element.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    };
    return { element, submit };
  }

  it('starts from the received member (linkedSignal) and returns the edited copy', async () => {
    const ana: Member = { name: 'Ana', email: 'ana@example.com', role: 'admin' };
    const { element, submit } = await setup(ana);

    const name = element.querySelector('ion-input') as IonFieldElement;
    expect(name.value).toBe('Ana');

    name.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'Ana María' } }));
    await submit();

    expect(modals.dismiss).toHaveBeenCalledWith({ ...ana, name: 'Ana María' }, 'confirm');
    expect(ana.name).toBe('Ana'); // el objeto recibido no se modificó
  });

  it('does not close while the form is invalid', async () => {
    const { element, submit } = await setup(null);

    await submit();

    expect(modals.dismiss).not.toHaveBeenCalled();
    const errors = Array.from(element.querySelectorAll<IonFieldElement>('ion-input')).map(
      (input) => input.errorText,
    );
    expect(errors).toContain('Este campo es obligatorio.');
  });

  it('cancels with the toolbar button', async () => {
    const { element } = await setup(null);

    element.querySelector<HTMLElement>('ion-buttons[slot="start"] ion-button')?.click();

    expect(modals.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });
});
