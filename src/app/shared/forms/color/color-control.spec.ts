import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, required } from '@angular/forms/signals';
import { ColorControl } from './color-control';

@Component({
  imports: [FormField, ColorControl],
  template: `
    <app-color label="Primario" [formField]="f.primary" />
    <app-color label="Libre" [(value)]="free" />
  `,
})
class Host {
  readonly model = signal({ primary: '#3880ff' });
  readonly f = form(this.model, (p) => required(p.primary));
  readonly free = signal('');
}

describe('ColorControl', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll<HTMLInputElement>('input[type="color"]');
    return { fixture, host: fixture.componentInstance, element, inputs };
  }

  it('shows the field color and writes the picked one', async () => {
    const { fixture, host, element, inputs } = await setup();
    expect(inputs[0].value).toBe('#3880ff');
    expect(element.textContent).toContain('#3880ff');

    inputs[0].value = '#ff0000';
    inputs[0].dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(host.model().primary).toBe('#ff0000');
    expect(element.textContent).toContain('#ff0000');
  });

  it('works without a form and shows the required error after blur', async () => {
    const { fixture, host, element, inputs } = await setup();
    inputs[1].value = '#00ff00';
    inputs[1].dispatchEvent(new Event('input'));
    expect(host.free()).toBe('#00ff00');

    host.f.primary().value.set('');
    inputs[0].dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(element.textContent).toContain('Este campo es obligatorio.');
  });
});
