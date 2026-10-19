import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { SelectControl } from './select-control';
import { SelectOption } from './select-option';

@Component({
  imports: [FormField, SelectControl],
  template: `
    <app-select
      [options]="options()"
      [allowNull]="true"
      [formField]="f.choice"
      (valueChange)="userChanges.push($event)"
    />
  `,
})
class Host {
  readonly options = signal<SelectOption<number>[]>([
    { value: 1, label: 'Uno' },
    { value: 2, label: 'Dos' },
  ]);
  readonly model = signal({ choice: 2 as number | null });
  readonly f = form(this.model);
  readonly userChanges: (number | null)[] = [];
}

type IonSelectElement = HTMLElement & { value: unknown };
type IonSelectOptionElement = HTMLElement & { value: unknown };

describe('SelectControl (Ionic)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector('ion-select') as IonSelectElement;
    /** Simula la elección del usuario: ion-select actualiza su valor y emite ionChange. */
    const choose = async (value: number | null) => {
      select.value = value;
      select.dispatchEvent(new CustomEvent('ionChange', { detail: { value } }));
      await fixture.whenStable();
    };
    const optionValues = () =>
      Array.from(
        fixture.nativeElement.querySelectorAll(
          'ion-select-option',
        ) as NodeListOf<IonSelectOptionElement>,
      ).map((option) => option.value);
    return { fixture, host: fixture.componentInstance, select, choose, optionValues };
  }

  it('passes the typed field value and options to ion-select', async () => {
    const { select, optionValues } = await setup();
    expect(select.value).toBe(2);
    expect(optionValues()).toEqual([null, 1, 2]); // null = "sin selección" (allowNull)
  });

  it('writes the typed value (number) when the user picks an option', async () => {
    const { host, choose } = await setup();
    await choose(1);
    expect(host.model().choice).toBe(1);
    expect(host.userChanges).toEqual([1]);
  });

  it('can go back to null when allowNull is set', async () => {
    const { host, choose } = await setup();
    await choose(null);
    expect(host.model().choice).toBeNull();
  });

  it('never changes the form value when the options change', async () => {
    const { fixture, host, select } = await setup();

    host.options.set([{ value: 9, label: 'Otro' }]);
    await fixture.whenStable();
    expect(host.model().choice).toBe(2);
    expect(select.value).toBe(2); // ion-select lo conserva y muestra el placeholder
  });

  it('does not emit valueChange when the value is set by code', async () => {
    const { fixture, host, select } = await setup();
    host.f.choice().value.set(1);
    await fixture.whenStable();
    expect(select.value).toBe(1);
    expect(host.userChanges).toEqual([]);
  });
});
