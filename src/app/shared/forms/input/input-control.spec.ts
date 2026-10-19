import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, email, form, required } from '@angular/forms/signals';
import { InputControl } from './input-control';

@Component({
  imports: [FormField, InputControl],
  template: `
    <app-input class="age" type="number" [formField]="f.age" />
    <app-input class="birth" type="date" [formField]="f.birth" />
    <app-input class="id" [digitsOnly]="true" [formField]="f.idNumber" />
    @for (phone of f.phones; track $index) {
      <app-input class="phone" [formField]="phone" />
    }
    <app-input class="email" label="Correo" type="email" [formField]="f.email" />
    <app-input class="secret" type="password" [(value)]="secret" />
  `,
})
class Host {
  readonly model = signal({
    age: 30 as number | null,
    birth: '1990-05-01T00:00:00' as string | null,
    idNumber: null as string | null,
    phones: ['0991', '0992'],
    email: '',
  });
  readonly f = form(this.model, (p) => {
    required(p.email);
    email(p.email);
  });
  readonly secret = signal('');
}

/** ion-input con sus propiedades: Angular las escribe como propiedades del elemento. */
type IonInputElement = HTMLElement & { value: string; errorText: string };

describe('InputControl (Ionic)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const input = (selector: string, index = 0) =>
      fixture.nativeElement.querySelectorAll(`${selector} ion-input`)[index] as IonInputElement;
    return {
      fixture,
      host: fixture.componentInstance,
      model: fixture.componentInstance.model,
      input,
    };
  }

  /** Simula lo que hace ion-input al escribir: actualiza su valor y emite ionInput. */
  function type(element: IonInputElement, text: string) {
    element.value = text;
    element.dispatchEvent(new CustomEvent('ionInput', { detail: { value: text } }));
  }

  it('delivers numbers for type="number" and null when empty', async () => {
    const { model, input } = await setup();
    type(input('.age'), '42');
    expect(model().age).toBe(42);

    type(input('.age'), '');
    expect(model().age).toBeNull();
  });

  it('delivers an empty string (not null) for empty text', async () => {
    const { model, input } = await setup();
    type(input('.email'), 'a@b.co');
    type(input('.email'), '');
    expect(model().email).toBe('');
  });

  it('shows ISO dates in the yyyy-MM-dd format', async () => {
    const { input } = await setup();
    expect(input('.birth').value).toBe('1990-05-01');
  });

  it('drops non-digits and keeps leading zeros with digitsOnly', async () => {
    const { model, input } = await setup();
    type(input('.id'), '09a1-2');
    expect(input('.id').value).toBe('0912');
    expect(model().idNumber).toBe('0912');
  });

  it('binds each item of an array field directly', async () => {
    const { model, input } = await setup();
    expect(input('.phone', 1).value).toBe('0992');

    type(input('.phone', 1), '0999');
    expect(model().phones).toEqual(['0991', '0999']);
  });

  it('passes the message to errorText and marks it invalid after blur', async () => {
    const { fixture, input } = await setup();
    type(input('.email'), 'no-es-correo');
    input('.email').dispatchEvent(new CustomEvent('ionBlur'));
    await fixture.whenStable();

    expect(input('.email').errorText).toBe('Ingresa un correo electrónico válido.');
    expect(input('.email').classList).toContain('ion-invalid');
    expect(input('.email').classList).toContain('ion-touched');
  });

  it('shows the label with the required asterisk and the password toggle', async () => {
    const { fixture, host, input } = await setup();
    const label = fixture.nativeElement.querySelector('.email app-control-label') as HTMLElement;
    expect(label.textContent).toContain('Correo');
    expect(label.textContent).toContain('*');

    expect(fixture.nativeElement.querySelector('.secret ion-input-password-toggle')).not.toBeNull();
    type(input('.secret'), 'clave');
    expect(host.secret()).toBe('clave');
  });
});
