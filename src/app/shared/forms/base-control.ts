import { Directive, computed, inject, input, model, output } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';
import { Span, spanClasses } from '../layout/span';
import { FORM_ERROR_MESSAGES, firstErrorMessage } from './error-messages';

/**
 * Base de todos los controles de formulario genéricos, para Signal Forms.
 *
 * El mismo contrato FormValueControl que en la base moderna (value = model(),
 * errors/disabled/touched/required rellenados por [formField] y el output
 * touch). Funciona con y sin formulario:
 *
 *   <app-input [formField]="f.name" />        (Signal Forms)
 *   <app-input [(value)]="search" />          (sin formulario)
 *
 * Diferencia con Ionic: los componentes de Ionic ya dibujan etiqueta, ayuda
 * (helperText) y error (errorText). Muestran el error solo si el elemento tiene
 * las clases ion-touched e ion-invalid; las subclases las enlazan con
 * ionClasses para que el control decida cuándo mostrarlo (y no Ionic).
 */
@Directive({
  host: { '[class]': 'hostClass()' },
})
export abstract class BaseControl<T> implements FormValueControl<T | null> {
  readonly value = model<T | null>(null);

  // ---- Estado del campo: lo enlaza [formField] automáticamente ----
  readonly errors = input<readonly ValidationError[]>([]);
  readonly disabled = input(false);
  readonly touched = input(false);
  readonly required = input(false);
  readonly touch = output<void>();

  // ---- Presentación ----
  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  /** API corta de ancho dentro de un grid de 12 columnas: 6 o [12, 6, 4]. */
  readonly span = input<Span | null | undefined>(null);

  private readonly messages = inject(FORM_ERROR_MESSAGES);

  protected readonly hostClass = computed(() => spanClasses(this.span()));
  protected readonly showError = computed(() => this.touched() && this.errors().length > 0);
  protected readonly errorMessage = computed(() =>
    this.showError() ? firstErrorMessage(this.errors(), this.messages) : null,
  );
  /**
   * Clases con las que Ionic decide mostrar errorText (ver checkInvalidState de Ionic).
   *
   * Van también las ng-*: en cada ionBlur, el ValueAccessor de Ionic BORRA las
   * clases ion-* y las vuelve a crear copiando las ng-* (pensado para Reactive
   * Forms). Sin ng-*, el error desaparecería al salir del campo.
   */
  protected readonly ionClasses = computed(() =>
    this.showError() ? 'ng-touched ng-invalid ion-touched ion-invalid' : '',
  );

  /** Llamar en el ionBlur del componente de Ionic. */
  protected markAsTouched(): void {
    this.touch.emit();
  }
}
