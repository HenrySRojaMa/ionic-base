import { Directive, computed, input } from '@angular/core';
import { Span, spanClasses } from './span';

/**
 * Aplica la API corta de span a cualquier elemento de un grid de 12 columnas:
 *
 *   <div class="grid grid-cols-12 gap-4">
 *     <button appSpan="6">...</button>
 *     <div [appSpan]="[12, 6, 4]">...</div>
 *   </div>
 *
 * Legacy: @HostBinding('class') + setter del @Input.
 * Moderno: host: { '[class]': ... } con un computed() derivado del input().
 */
@Directive({
  selector: '[appSpan]',
  host: { '[class]': 'classes()' },
})
export class SpanDirective {
  readonly appSpan = input<Span | `${number}` | '' | null | undefined>(null);

  protected readonly classes = computed(() => {
    const span = this.appSpan();
    return spanClasses(typeof span === 'string' ? (span ? (Number(span) as Span) : null) : span);
  });
}
