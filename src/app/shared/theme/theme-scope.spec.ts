import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemePalette } from './theme-palette';
import { ThemeScope } from './theme-scope';

@Component({
  imports: [ThemeScope],
  template: `<section [appThemeScope]="palette()"><span>dentro</span></section>`,
})
class Host {
  readonly palette = signal<ThemePalette | null>({ primary: '#ff0000' });
}

describe('ThemeScope', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    const setPalette = async (palette: ThemePalette | null) => {
      fixture.componentInstance.palette.set(palette); // un signal marca la vista: sin markForCheck
      await fixture.whenStable();
    };
    return { section, setPalette };
  }

  it('defines the variables on its element only', async () => {
    const { section } = await setup();

    expect(section.style.getPropertyValue('--ion-color-primary')).toBe('#ff0000');
    expect(document.documentElement.style.getPropertyValue('--ion-color-primary')).toBe('');
  });

  it('updates and clears the variables when the palette changes', async () => {
    const { section, setPalette } = await setup();

    await setPalette({ accent: '#00ff00' });
    expect(section.style.getPropertyValue('--ion-color-primary')).toBe('');
    expect(section.style.getPropertyValue('--ion-color-tertiary')).not.toBe('');

    await setPalette(null);
    expect(section.style.getPropertyValue('--ion-color-tertiary')).toBe('');
  });
});
