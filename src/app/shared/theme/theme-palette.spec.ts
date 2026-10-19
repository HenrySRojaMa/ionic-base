import { contrastColor, isHexColor, paletteToCssVariables } from './theme-palette';

describe('theme palette (Ionic)', () => {
  it('generates the six Ionic variables of a color', () => {
    // #3880ff es el primario por defecto de Ionic: shade y tint coinciden con los oficiales.
    // El contraste NO: Ionic usa texto blanco (3.6:1, no cumple AA para texto normal);
    // por WCAG el negro es más legible (5.8:1), y esta función prioriza la accesibilidad.
    expect(paletteToCssVariables({ primary: '#3880ff' })).toEqual({
      '--ion-color-primary': '#3880ff',
      '--ion-color-primary-rgb': '56, 128, 255',
      '--ion-color-primary-contrast': '#000000',
      '--ion-color-primary-contrast-rgb': '0, 0, 0',
      '--ion-color-primary-shade': '#3171e0',
      '--ion-color-primary-tint': '#4c8dff',
    });
  });

  it('maps accent and neutral to tertiary and medium', () => {
    const variables = paletteToCssVariables({ accent: '#5260ff', neutral: '#92949c' });
    expect(variables['--ion-color-tertiary']).toBe('#5260ff');
    expect(variables['--ion-color-medium']).toBe('#92949c');
  });

  it('sets background and readable text color from the base color', () => {
    const variables = paletteToCssVariables({ base: '#111111' });
    expect(variables['--ion-background-color']).toBe('#111111');
    expect(variables['--ion-text-color']).toBe('#ffffff');
  });

  it('picks the most readable text color (WCAG)', () => {
    expect(contrastColor([255, 255, 0])).toEqual([0, 0, 0]); // amarillo -> texto negro
    expect(contrastColor([30, 58, 138])).toEqual([255, 255, 255]); // azul oscuro -> blanco
  });

  it('ignores invalid colors', () => {
    expect(paletteToCssVariables({ primary: 'blue' })).toEqual({});
    expect(isHexColor('#abc')).toBe(true);
    expect(isHexColor('#ab')).toBe(false);
  });
});
