import { TestBed } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular';
import { ThemeService } from '@core/theme/theme.service';
import { ThemePage } from './theme-page';

describe('ThemePage', () => {
  const root = document.documentElement;

  afterEach(() => {
    TestBed.inject(ThemeService).resetPalette();
    TestBed.tick();
  });

  async function setup() {
    TestBed.configureTestingModule({ providers: [provideIonicAngular()] });
    const fixture = TestBed.createComponent(ThemePage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const preview = element.querySelector('[aria-label="Vista previa del tema"]') as HTMLElement;
    const click = async (text: string) => {
      Array.from(element.querySelectorAll('ion-button'))
        .find((b) => b.textContent?.includes(text))
        ?.click();
      await fixture.whenStable();
    };
    return { fixture, element, preview, click };
  }

  it('previews the palette only inside the preview block', async () => {
    const { fixture, element, preview } = await setup();

    const primary = element.querySelector('input[type="color"]') as HTMLInputElement;
    primary.value = '#ff0000';
    primary.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(preview.style.getPropertyValue('--ion-color-primary')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('');
  });

  it('applies the palette to the whole app and resets it', async () => {
    const { click } = await setup();

    await click('Aplicar a toda la app');
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('#2563eb');

    await click('Restablecer tema');
    expect(root.style.getPropertyValue('--ion-color-primary')).toBe('');
  });
});
