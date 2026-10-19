import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { ImageFileControl, ImageValue, ImageValueMode } from './image-file-control';
import { IMAGE_PICKER } from './image-picker';

@Component({
  imports: [FormField, ImageFileControl],
  template: `<app-image-file label="Logo" [mode]="mode()" [maxSizeKb]="1" [formField]="f.logo" />`,
})
class Host {
  readonly mode = signal<ImageValueMode>('dataUrl');
  readonly model = signal({ logo: null as ImageValue | null });
  readonly f = form(this.model);
}

/** PNG de 1x1 píxel. */
const PIXEL =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const pngFile = () =>
  new File([Uint8Array.from(atob(PIXEL), (c) => c.charCodeAt(0))], 'pixel.png', {
    type: 'image/png',
  });

describe('ImageFileControl (Ionic)', () => {
  /** Falso de IMAGE_PICKER: en la app real es la cámara/galería de MediaService. */
  let picked: File | null;
  const picker = { pickImage: vi.fn(async () => picked) };

  async function setup(mode: ImageValueMode = 'dataUrl', logo: ImageValue | null = null) {
    TestBed.configureTestingModule({ providers: [{ provide: IMAGE_PICKER, useValue: picker }] });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.mode.set(mode);
    fixture.componentInstance.model.set({ logo });
    await fixture.whenStable();
    const button = () => fixture.nativeElement.querySelector('ion-button') as HTMLElement;
    return { fixture, model: fixture.componentInstance.model, button };
  }

  /** El picker y FileReader son asíncronos: se espera a que el valor cambie. */
  const waitForValue = (read: () => unknown) => vi.waitFor(() => expect(read()).not.toBeNull());

  it('delivers a data URL from the picked image and shows the preview', async () => {
    const { fixture, model, button } = await setup();
    picked = pngFile();

    button().click();
    await waitForValue(() => model().logo);
    await fixture.whenStable();

    expect(picker.pickImage).toHaveBeenCalledWith({ maxWidth: 1280 });
    expect(model().logo).toBe(`data:image/png;base64,${PIXEL}`);
    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
  });

  it('delivers only the base64 part in base64 mode', async () => {
    const { model, button } = await setup('base64');
    picked = pngFile();

    button().click();
    await waitForValue(() => model().logo);

    expect(model().logo).toBe(PIXEL);
  });

  it('keeps the value when the user cancels', async () => {
    const { fixture, model, button } = await setup();
    picked = null;

    button().click();
    await fixture.whenStable();

    expect(model().logo).toBeNull();
    expect(fixture.componentInstance.f.logo().touched()).toBe(true);
  });

  it('rejects images bigger than maxSizeKb', async () => {
    const { fixture, model, button } = await setup();
    picked = new File([new Uint8Array(2048)], 'big.png', { type: 'image/png' });

    button().click();
    await vi.waitFor(() =>
      expect(fixture.nativeElement.textContent).toContain('no puede superar los 1 KB'),
    );
    expect(model().logo).toBeNull();
  });

  it('shows an existing image URL (edit mode) and can clear it', async () => {
    const { fixture, model, button } = await setup('dataUrl', 'https://example.com/logo.png');
    expect(fixture.nativeElement.querySelector('img').src).toBe('https://example.com/logo.png');

    button().click(); // con vista previa, el único botón es "Quitar imagen"
    await fixture.whenStable();
    expect(model().logo).toBeNull();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });
});
