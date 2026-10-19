import { Component, linkedSignal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { InputControl } from '@shared/forms/input/input-control';
import { SelectControl } from '@shared/forms/select/select-control';
import { SelectOption } from '@shared/forms/select/select-option';
import { ModalInteraction } from '@shared/modal/modal-interaction';
import { Member, MemberRole, ROLE_LABELS } from '../../models/showcase.models';

const NEW_MEMBER: Member = { name: '', email: '', role: 'member' };

/**
 * Editor que la tabla abre en un modal (config.editor): recibe null para crear o
 * una COPIA del integrante para editar, y devuelve el resultado con close().
 *
 * Misma lógica que en la base moderna (linkedSignal + Signal Forms). Lo propio
 * de Ionic es la forma del modal: ion-header con Cancelar/Guardar en la barra
 * (patrón de iOS y Android) e ion-content con el formulario.
 */
@Component({
  selector: 'app-member-editor',
  imports: [
    FormRoot,
    FormField,
    InputControl,
    SelectControl,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
  ],
  templateUrl: './member-editor.html',
})
export class MemberEditor extends ModalInteraction<Member | null, Member> {
  protected readonly model = linkedSignal<Member>(() => ({ ...NEW_MEMBER, ...this.data() }));

  protected readonly f = form(
    this.model,
    (p) => {
      required(p.name);
      required(p.email);
      email(p.email);
    },
    { submission: { action: async () => this.close(this.model()) } },
  );

  protected readonly roles: SelectOption<MemberRole>[] = (
    Object.keys(ROLE_LABELS) as MemberRole[]
  ).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
}
