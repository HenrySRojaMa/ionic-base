import { JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSpinner,
} from '@ionic/angular';
import { PlaceApi } from '@domain/place/place.api';
import { Place } from '@domain/place/place.models';
import { cascadeChildren } from '@shared/forms/cascade';
import { SelectControl } from '@shared/forms/select/select-control';
import { SelectOption, toOptions } from '@shared/forms/select/select-option';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';

const toPlaceOptions = (places: Place[]): SelectOption<number>[] =>
  toOptions(
    places,
    (place) => place.id,
    (place) => place.name,
  );

interface Address {
  country: number | null;
  state: number | null;
  city: number | null;
}

/**
 * Selects en cascada derivados del VALOR del formulario. El catálogo es un
 * httpResource y cada nivel un computed(): sin RxJS, sin async pipe y sin
 * suscripciones (legacy usaba combineLatest + shareReplay + async).
 *
 * Lógica idéntica a la base moderna; en Ionic el (valueChange) del select nace
 * de ionChange, que solo se dispara por interacción del usuario.
 */
@Component({
  selector: 'app-cascade-page',
  imports: [
    FormField,
    JsonPipe,
    SelectControl,
    PageToolbar,
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonSpinner,
  ],
  templateUrl: './cascade-page.html',
})
export class CascadePage {
  protected readonly places = inject(PlaceApi).allResource();

  protected readonly model = signal<Address>({ country: null, state: null, city: null });
  protected readonly f = form(this.model, (p) => {
    required(p.country);
    required(p.state);
    required(p.city);
  });

  private readonly states = cascadeChildren(
    () => this.places.value(),
    () => this.model().country,
    (place) => place.id,
    (place) => place.children,
  );
  private readonly cities = cascadeChildren(
    this.states,
    () => this.model().state,
    (place) => place.id,
    (place) => place.children,
  );

  protected readonly countryOptions = computed(() => toPlaceOptions(this.places.value()));
  protected readonly stateOptions = computed(() => toPlaceOptions(this.states()));
  protected readonly cityOptions = computed(() => toPlaceOptions(this.cities()));

  /** Solo cuando el USUARIO cambia el padre se limpian los hijos. */
  protected onCountryChosen(): void {
    this.model.update((m) => ({ ...m, state: null, city: null }));
  }

  protected onStateChosen(): void {
    this.model.update((m) => ({ ...m, city: null }));
  }

  /** Modo edición: los tres valores llegan juntos y nada se borra. */
  protected loadSaved(): void {
    this.model.set({ country: 1, state: 12, city: 121 });
  }
}
