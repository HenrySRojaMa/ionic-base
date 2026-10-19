import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, disabled, form, required, submit } from '@angular/forms/signals';
import { BaseControl } from './base-control';

/**
 * Control mínimo con un input nativo para probar la clase base aislada de
 * Ionic: [class] recibe ionClasses igual que lo haría un ion-input.
 */
@Component({
  selector: 'app-test-control',
  template: `
    <input
      [class]="ionClasses()"
      [value]="value() ?? ''"
      [disabled]="disabled()"
      (input)="value.set($any($event.target).value)"
      (blur)="markAsTouched()"
    />
    <p class="error">{{ errorMessage() }}</p>
  `,
})
class TestControl extends BaseControl<string> {}

@Component({
  imports: [FormField, TestControl],
  template: `
    <app-test-control [span]="6" [formField]="f.name" />
    <app-test-control [(value)]="search" />
    <button type="button" class="submit" (click)="save()">Guardar</button>
  `,
})
class Host {
  readonly model = signal({ name: 'Ana', locked: false });
  readonly f = form(this.model, (p) => {
    required(p.name);
    disabled(p.name, ({ valueOf }) => valueOf(p.locked));
  });
  readonly search = signal('inicial');

  save(): void {
    void submit(this.f, async () => undefined); // marca todo como tocado
  }
}

describe('BaseControl (Ionic)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const [bound, free] = Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
    return { fixture, host: fixture.componentInstance, bound, free };
  }

  function type(input: HTMLInputElement, text: string) {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  }

  it('syncs with the form field in both directions', async () => {
    const { fixture, host, bound } = await setup();
    expect(bound.value).toBe('Ana');

    type(bound, 'Luis');
    expect(host.model().name).toBe('Luis');

    host.f.name().value.set('Eva');
    await fixture.whenStable();
    expect(bound.value).toBe('Eva');
  });

  it('works without any form with [(value)]', async () => {
    const { host, free } = await setup();
    type(free, 'nuevo');
    expect(host.search()).toBe('nuevo');
  });

  it('receives the disabled state declared in the schema', async () => {
    const { fixture, host, bound } = await setup();
    host.model.update((m) => ({ ...m, locked: true }));
    await fixture.whenStable();
    expect(bound.disabled).toBe(true);
  });

  it('adds the Ionic invalid classes and the message only after submit', async () => {
    const { fixture, bound } = await setup();
    type(bound, '');
    await fixture.whenStable();
    expect(bound.className).toBe('');

    fixture.nativeElement.querySelector('.submit').click();
    await fixture.whenStable();
    expect(bound.classList).toContain('ion-touched');
    expect(bound.classList).toContain('ion-invalid');
    expect(fixture.nativeElement.querySelector('.error').textContent).toContain(
      'Este campo es obligatorio.',
    );
  });

  it('marks the field as touched on blur and applies the span classes', async () => {
    const { fixture, host, bound } = await setup();
    bound.dispatchEvent(new Event('blur'));
    expect(host.f.name().touched()).toBe(true);

    const control = fixture.nativeElement.querySelector('app-test-control') as HTMLElement;
    expect(control.className).toBe('col-span-full md:col-span-6');
  });
});
