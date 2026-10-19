import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, maxLength } from '@angular/forms/signals';
import { TextAreaControl } from './text-area-control';

@Component({
  imports: [FormField, TextAreaControl],
  template: `<app-text-area [rows]="3" [formField]="f.bio" />`,
})
class Host {
  readonly model = signal({ bio: 'Hola' });
  // El límite se declara UNA vez en el esquema: valida y alimenta el contador.
  readonly f = form(this.model, (p) => maxLength(p.bio, 20));
}

type IonTextareaElement = HTMLElement & {
  value: string;
  rows: number;
  maxlength: number;
  counter: boolean;
};

describe('TextAreaControl (Ionic)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const textarea = fixture.nativeElement.querySelector('ion-textarea') as IonTextareaElement;
    const type = (text: string) => {
      textarea.value = text;
      textarea.dispatchEvent(new CustomEvent('ionInput', { detail: { value: text } }));
    };
    return { fixture, model: fixture.componentInstance.model, textarea, type };
  }

  it('binds the value and takes the counter limit from the schema', async () => {
    const { model, textarea, type } = await setup();

    expect(textarea.value).toBe('Hola');
    expect(textarea.rows).toBe(3);
    expect(textarea.maxlength).toBe(20);
    expect(textarea.counter).toBe(true);

    type('Hola mundo');
    expect(model().bio).toBe('Hola mundo');
  });

  it('delivers an empty string when emptied (Signal Forms convention)', async () => {
    const { model, type } = await setup();
    type('');
    expect(model().bio).toBe('');
  });
});
