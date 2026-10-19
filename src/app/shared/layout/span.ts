/** Columnas que ocupa un elemento dentro de un contenedor "grid grid-cols-12". */
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * API corta para el ancho responsivo de un campo:
 *
 *   6            -> 12 columnas en móvil, 6 desde md
 *   [12, 6, 4]   -> [sm, md, lg]
 *   [, 6]        -> solo md (los huecos se omiten)
 *
 * En móvil (sin prefijo) siempre ocupa el ancho completo.
 */
export type Span = ColSpan | readonly [ColSpan?, ColSpan?, ColSpan?];

/*
 * Clases escritas COMPLETAS a propósito. Tailwind 4 escanea el código fuente como texto
 * (detección automática de fuentes, sin tailwind.config.js) y solo genera las clases que encuentra
 * literalmente. Construirlas con 'md:col-span-' + n obligaría a usar safelist.
 */
const SM: Record<ColSpan, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12',
};

const MD: Record<ColSpan, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

const LG: Record<ColSpan, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

export function spanClasses(span: Span | null | undefined): string {
  const classes = ['col-span-full'];
  if (span === null || span === undefined) return classes[0];

  const [sm, md, lg] = typeof span === 'number' ? [undefined, span, undefined] : span;
  if (sm) classes.push(SM[sm]);
  if (md) classes.push(MD[md]);
  if (lg) classes.push(LG[lg]);
  return classes.join(' ');
}
