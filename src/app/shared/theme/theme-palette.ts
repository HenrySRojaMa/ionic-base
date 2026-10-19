/**
 * Paleta parametrizable (por cliente o institución). Colores en hexadecimal.
 * Misma forma que en las bases web, traducida a las variables de Ionic:
 *
 *   primary   -> --ion-color-primary
 *   secondary -> --ion-color-secondary
 *   accent    -> --ion-color-tertiary
 *   neutral   -> --ion-color-medium
 *   base      -> --ion-background-color y --ion-text-color
 */
export interface ThemePalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  base?: string;
}

export type CssVariables = Record<string, string>;

const IONIC_COLORS: Record<Exclude<keyof ThemePalette, 'base'>, string> = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'tertiary',
  neutral: 'medium',
};

type Rgb = [number, number, number];

/**
 * Traduce una paleta a variables de Ionic. Cada color de Ionic necesita seis
 * variables: el color, su versión RGB, el color de contraste (texto encima), su
 * RGB, "shade" (12% más oscuro, para estados activos) y "tint" (10% más claro,
 * para hover). Es la misma fórmula que usa el generador de colores de Ionic.
 */
export function paletteToCssVariables(palette: ThemePalette): CssVariables {
  const variables: CssVariables = {};

  for (const [key, name] of Object.entries(IONIC_COLORS)) {
    const rgb = parseHex(palette[key as keyof ThemePalette]);
    if (!rgb) continue;
    const contrast = contrastColor(rgb);
    const prefix = `--ion-color-${name}`;
    variables[prefix] = toHex(rgb);
    variables[`${prefix}-rgb`] = rgb.join(', ');
    variables[`${prefix}-contrast`] = toHex(contrast);
    variables[`${prefix}-contrast-rgb`] = contrast.join(', ');
    variables[`${prefix}-shade`] = toHex(mix(rgb, [0, 0, 0], 0.12));
    variables[`${prefix}-tint`] = toHex(mix(rgb, [255, 255, 255], 0.1));
  }

  const base = parseHex(palette.base);
  if (base) {
    const text = contrastColor(base);
    variables['--ion-background-color'] = toHex(base);
    variables['--ion-background-color-rgb'] = base.join(', ');
    variables['--ion-text-color'] = toHex(text);
    variables['--ion-text-color-rgb'] = text.join(', ');
  }

  return variables;
}

/** Todos los nombres de variables que puede generar una paleta (para limpiarlas). */
export const PALETTE_CSS_VARIABLES: readonly string[] = [
  ...Object.values(IONIC_COLORS).flatMap((name) =>
    ['', '-rgb', '-contrast', '-contrast-rgb', '-shade', '-tint'].map(
      (suffix) => `--ion-color-${name}${suffix}`,
    ),
  ),
  '--ion-background-color',
  '--ion-background-color-rgb',
  '--ion-text-color',
  '--ion-text-color-rgb',
];

export function isHexColor(value: string | null | undefined): boolean {
  return !!value && /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/**
 * Negro o blanco, el que más contraste tenga con el color según la fórmula de
 * WCAG (luminancia relativa). Así el texto sobre un botón siempre es legible.
 */
export function contrastColor(rgb: Rgb): Rgb {
  const luminance = relativeLuminance(rgb);
  const contrastWithBlack = (luminance + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithBlack >= contrastWithWhite ? [0, 0, 0] : [255, 255, 255];
}

function relativeLuminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function mix(color: Rgb, other: Rgb, weight: number): Rgb {
  return color.map((channel, i) => Math.round(channel * (1 - weight) + other[i] * weight)) as Rgb;
}

function parseHex(value: string | undefined): Rgb | null {
  if (!isHexColor(value)) return null;
  let hex = (value as string).trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return [0, 2, 4].map((start) => parseInt(hex.substring(start, start + 2), 16)) as Rgb;
}

function toHex(rgb: Rgb): string {
  return '#' + rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('');
}
