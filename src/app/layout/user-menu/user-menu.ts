import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonItem, IonLabel, IonMenuToggle } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logInOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { AUTH_PATHS } from '@core/auth/auth-paths';
import { AuthService } from '@core/auth/auth.service';
import { SessionService } from '@core/auth/session.service';

/**
 * Sesión en el menú lateral: "Ingresar" sin sesión; el usuario y "Cerrar sesión"
 * con sesión. Lee el signal user(). En móvil la cuenta va en el menú, no en la
 * barra superior (que es de cada página).
 */
@Component({
  selector: 'app-user-menu',
  imports: [RouterLink, IonItem, IonIcon, IonLabel, IonMenuToggle],
  template: `
    @if (user(); as user) {
      <ion-item lines="none">
        <ion-icon slot="start" name="person-circle-outline" aria-hidden="true" />
        <ion-label>{{ user.displayName }}</ion-label>
      </ion-item>
      <ion-menu-toggle [autoHide]="false">
        <ion-item button detail="false" lines="none" (click)="logout()">
          <ion-icon slot="start" name="log-out-outline" aria-hidden="true" />
          <ion-label>Cerrar sesión</ion-label>
        </ion-item>
      </ion-menu-toggle>
    } @else {
      <ion-menu-toggle [autoHide]="false">
        <ion-item [routerLink]="loginPath" detail="false" lines="none">
          <ion-icon slot="start" name="log-in-outline" aria-hidden="true" />
          <ion-label>Ingresar</ion-label>
        </ion-item>
      </ion-menu-toggle>
    }
  `,
})
export class UserMenu {
  protected readonly user = inject(SessionService).user;
  protected readonly loginPath = AUTH_PATHS.login;
  private readonly auth = inject(AuthService);

  constructor() {
    addIcons({ personCircleOutline, logOutOutline, logInOutline });
  }

  protected logout(): void {
    this.auth.logout();
  }
}
