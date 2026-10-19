import { spanClasses } from './span';

describe('spanClasses', () => {
  it('uses the full width when no span is given', () => {
    expect(spanClasses(undefined)).toBe('col-span-full');
  });

  it('treats a single number as the md breakpoint', () => {
    expect(spanClasses(6)).toBe('col-span-full md:col-span-6');
  });

  it('maps an array to sm, md and lg', () => {
    expect(spanClasses([12, 6, 4])).toBe(
      'col-span-full sm:col-span-12 md:col-span-6 lg:col-span-4',
    );
  });

  it('skips holes in the array', () => {
    expect(spanClasses([undefined, undefined, 3])).toBe('col-span-full lg:col-span-3');
  });
});
