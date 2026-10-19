import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
} from '@ionic/angular';
import { DialogService } from '@core/dialog/dialog.service';
import { minItems } from '@shared/forms/app-validators';
import { InputControl } from '@shared/forms/input/input-control';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';
import { DataTable } from '@shared/table/data-table';
import { TableConfig } from '@shared/table/table-config';
import { MemberEditor } from '../../components/member-editor/member-editor';
import { Member, Product, ROLE_LABELS } from '../../models/showcase.models';

interface Team {
  team: string;
  members: Member[];
}

/**
 * La tabla genérica en sus dos modos. Misma lógica que la base moderna; la
 * tabla se dibuja como lista (acciones al deslizar en el teléfono) y el editor
 * se abre como hoja inferior (editorOptions.sheet).
 */
@Component({
  selector: 'app-table-page',
  imports: [
    FormField,
    JsonPipe,
    InputControl,
    DataTable,
    PageToolbar,
    IonHeader,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
  ],
  templateUrl: './table-page.html',
})
export class TablePage {
  private readonly dialogs = inject(DialogService);

  // ---- Modo interno: la tabla es un campo del formulario ------------------

  protected readonly teamModel = signal<Team>({
    team: 'Equipo Alfa',
    members: [
      { name: 'Ana Torres', email: 'ana@example.com', role: 'owner' },
      { name: 'Luis Pérez', email: 'luis@example.com', role: 'member' },
    ],
  });
  protected readonly f = form(
    this.teamModel,
    (p) => {
      required(p.team);
      minItems(p.members, 1);
    },
    { submission: { action: async () => this.submitted.set(this.teamModel()) } },
  );
  protected readonly submitted = signal<Team | null>(null);

  protected readonly membersTable: TableConfig<Member> = {
    columns: [
      { header: 'Nombre', field: 'name' },
      { header: 'Correo', field: 'email' },
      { header: 'Rol', value: (member) => ROLE_LABELS[member.role] },
    ],
    actions: { add: true, edit: true, delete: true },
    addLabel: 'Integrante',
    editor: MemberEditor,
    editorOptions: { sheet: { initial: 0.75 } },
    confirmDelete: '¿Quitar a este integrante del equipo?',
    canDelete: (member) => member.role !== 'owner', // el propietario no se puede quitar
  };

  // ---- Modo externo: la página decide qué hacer con cada acción -----------

  protected readonly products = signal<Product[]>([
    { id: 1, name: 'Teclado', price: 35.5, active: true },
    { id: 2, name: 'Mouse', price: 18, active: true },
    { id: 3, name: 'Monitor', price: 189.99, active: false },
  ]);

  protected readonly productsTable: TableConfig<Product> = {
    columns: [
      { header: 'Producto', field: 'name' },
      { header: 'Precio', value: (product) => `$ ${product.price.toFixed(2)}` },
      { header: 'Activo', field: 'active' },
    ],
    actions: { add: true, edit: true, delete: true },
    addLabel: 'Producto',
    trackBy: (product) => product.id,
  };

  protected saveTeam(): void {
    this.submitted.set(null);
    void submit(this.f);
  }

  protected onProductAdd(): void {
    void this.dialogs.info('Aquí la página abriría su propio formulario o llamaría a la API.');
  }

  protected onProductEdit(product: Product): void {
    void this.dialogs.info(`Editar "${product.name}": la página decide cómo hacerlo.`);
  }

  async onProductDelete(product: Product): Promise<void> {
    if (!(await this.dialogs.confirm(`¿Eliminar "${product.name}"?`))) return;
    // En un proyecto real: llamar a la API y, al responder, actualizar la lista.
    // Al ser un signal, la vista se actualiza sola (legacy necesitaba markForCheck).
    this.products.update((list) => list.filter((p) => p.id !== product.id));
  }
}
