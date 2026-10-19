import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormField,
  applyEach,
  email,
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonNote,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline } from 'ionicons/icons';
import { digits } from '@shared/forms/app-validators';
import { ImageFileControl } from '@shared/forms/image-file/image-file-control';
import { InputControl } from '@shared/forms/input/input-control';
import { SelectControl } from '@shared/forms/select/select-control';
import { SelectOption } from '@shared/forms/select/select-option';
import { TextAreaControl } from '@shared/forms/text-area/text-area-control';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';

interface Reference {
  name: string;
  relation: string | null;
}

interface PersonForm {
  name: string;
  email: string;
  idNumber: string;
  birthDate: string | null;
  age: number | null;
  bio: string;
  photo: string | null;
  phones: string[];
  references: Reference[];
}

const EMPTY: PersonForm = {
  name: '',
  email: '',
  idNumber: '',
  birthDate: null,
  age: null,
  bio: '',
  photo: null,
  phones: [''],
  references: [],
};

/**
 * Formulario maestro con Signal Forms: el MODELO es un signal con los datos
 * (incluidos arreglos de valores y de objetos) y las reglas se declaran en el
 * esquema. Cada campo se entrega a su control con [formField].
 *
 * Comparado con legacy: no hay FormGroup/FormArray/FormControl. Agregar un
 * teléfono es agregar un elemento al arreglo del modelo, y cargar un registro
 * para editar es model.set(registro): no hay que redimensionar nada.
 *
 * La lógica (modelo, esquema, métodos) es IDÉNTICA a la de la base moderna:
 * solo cambian la plantilla y los imports (Ionic en vez de daisyUI). Es la
 * prueba de que los controles genéricos aíslan la vista.
 */
@Component({
  selector: 'app-forms-page',
  imports: [
    FormField,
    JsonPipe,
    InputControl,
    SelectControl,
    TextAreaControl,
    ImageFileControl,
    PageToolbar,
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonChip,
    IonNote,
  ],
  templateUrl: './forms-page.html',
})
export class FormsPage {
  protected readonly model = signal<PersonForm>(EMPTY);
  protected readonly submitted = signal<PersonForm | null>(null);

  protected readonly f = form(
    this.model,
    (p) => {
      required(p.name);
      maxLength(p.name, 80);
      required(p.email);
      email(p.email);
      required(p.idNumber);
      digits(p.idNumber);
      minLength(p.idNumber, 10);
      // min/max también llegan solos a los atributos min/max del <input type="number">.
      min(p.age, 18);
      max(p.age, 120);
      maxLength(p.bio, 300);
      // Reglas para CADA elemento de un arreglo:
      applyEach(p.phones, (phone) => {
        required(phone);
        digits(phone);
      });
      applyEach(p.references, (reference) => {
        required(reference.name);
        required(reference.relation);
      });
    },
    { submission: { action: async () => this.submitted.set(this.model()) } },
  );

  protected readonly relations: SelectOption<string>[] = [
    { value: 'family', label: 'Familiar' },
    { value: 'work', label: 'Laboral' },
    { value: 'friend', label: 'Amistad' },
  ];

  constructor() {
    addIcons({ addOutline, closeOutline });
  }

  protected addPhone(): void {
    this.model.update((m) => ({ ...m, phones: [...m.phones, ''] }));
  }

  protected removePhone(index: number): void {
    this.model.update((m) => ({ ...m, phones: m.phones.filter((_, i) => i !== index) }));
  }

  protected addReference(): void {
    this.model.update((m) => ({
      ...m,
      references: [...m.references, { name: '', relation: null }],
    }));
  }

  protected removeReference(index: number): void {
    this.model.update((m) => ({ ...m, references: m.references.filter((_, i) => i !== index) }));
  }

  /** Modo edición: un solo set() con los datos, con arreglos de cualquier tamaño. */
  protected loadExample(): void {
    this.model.set({
      name: 'Ana Torres',
      email: 'ana@example.com',
      idNumber: '0912345678',
      birthDate: '1990-05-01T00:00:00',
      age: 34,
      bio: 'Datos cargados con model.set(), como al editar un registro existente.',
      photo: null,
      phones: ['0991234567', '042123456'],
      references: [
        { name: 'Luis Torres', relation: 'family' },
        { name: 'Carla Ruiz', relation: 'work' },
      ],
    });
    this.submitted.set(null);
  }

  protected reset(): void {
    this.model.set(EMPTY);
    this.f().reset();
    this.submitted.set(null);
  }

  /** Sin <form>: se llama a submit() directamente (marca todo como tocado y valida). */
  protected save(): void {
    this.submitted.set(null);
    void submit(this.f);
  }
}
