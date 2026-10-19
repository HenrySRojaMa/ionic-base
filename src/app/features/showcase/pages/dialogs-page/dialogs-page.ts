import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  IonText,
} from '@ionic/angular';
import { Observable, finalize, forkJoin } from 'rxjs';
import { SessionService } from '@core/auth/session.service';
import { DialogService } from '@core/dialog/dialog.service';
import { PageToolbar } from '@shared/layout/page-toolbar/page-toolbar';
import { ShowcaseDemoApi } from '../../data/showcase-demo.api';

/**
 * Diálogos y opciones HTTP por petición. La lógica es la de la base moderna;
 * los diálogos ahora son nativos de Ionic: success es un toast (no interrumpe)
 * y error/warning/info/confirm son ion-alert.
 */
@Component({
  selector: 'app-dialogs-page',
  imports: [
    RouterLink,
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
    IonText,
  ],
  templateUrl: './dialogs-page.html',
})
export class DialogsPage {
  private readonly demoApi = inject(ShowcaseDemoApi);
  private readonly dialogs = inject(DialogService);
  private readonly session = inject(SessionService);

  protected readonly isAuthenticated = this.session.isAuthenticated;
  /** Qué botón está esperando respuesta (para su spinner). */
  protected readonly busy = signal<string | null>(null);
  protected readonly log = signal<string[]>([]);

  // ---- Mensajes directos ------------------------------------------------------

  protected showSuccess(): void {
    void this.dialogs.success('Los datos se guardaron correctamente.');
  }

  protected showError(): void {
    void this.dialogs.error('No se pudo completar la operación.');
  }

  protected showWarning(): void {
    void this.dialogs.warning('Tu suscripción vence en 3 días.');
  }

  protected async askConfirmation(): Promise<void> {
    const confirmed = await this.dialogs.confirm('¿Deseas continuar?');
    void this.dialogs.info(confirmed ? 'Elegiste continuar.' : 'Cancelaste la operación.');
  }

  // ---- Peticiones HTTP con diálogos automáticos --------------------------------

  protected callSuccess(): void {
    this.run('success', this.demoApi.success());
  }

  protected callValidationError(): void {
    this.run('error', this.demoApi.validationError());
  }

  protected callServerError(): void {
    this.run('server', this.demoApi.serverError());
  }

  protected callConflict(): void {
    this.run(
      'conflict',
      this.demoApi.conflict((error) => this.handleConflict(error)),
    );
  }

  /** Manejo dedicado de un caso concreto: reemplaza al modal de error genérico. */
  handleConflict(error: HttpErrorResponse): boolean {
    if (error.status !== HttpStatusCode.Conflict) return false;
    void this.dialogs.warning(
      'Ese código ya está registrado. Usa otro código o edita el registro existente.',
      'Registro duplicado',
    );
    return true;
  }

  // ---- Refresh de token con cola ------------------------------------------------

  /**
   * Reemplaza el token por uno vencido y lanza 3 peticiones protegidas a la vez:
   * el interceptor recibe tres 401, hace UN solo refresh y reintenta las tres.
   */
  simulateExpiredToken(): void {
    const current = this.session.session();
    if (!current) return;

    const expired = current.accessToken.replace(/\.\d+$/, '.0');
    this.session.start({ ...current, accessToken: expired });
    this.log.set([`Token vencido: ${expired}`]);

    this.busy.set('refresh');
    forkJoin([
      this.demoApi.protectedData(),
      this.demoApi.protectedData(),
      this.demoApi.protectedData(),
    ])
      .pipe(finalize(() => this.busy.set(null)))
      .subscribe({
        next: (responses) =>
          this.log.update((lines) => [
            ...lines,
            `${responses.length} peticiones respondidas correctamente.`,
            `Token nuevo: ${this.session.accessToken()}`,
          ]),
        error: () =>
          this.log.update((lines) => [...lines, 'El refresh falló: la sesión se cerró.']),
      });
  }

  private run(key: string, request$: Observable<unknown>): void {
    this.busy.set(key);
    // El diálogo lo muestra el interceptor; aquí solo se maneja el spinner.
    request$.pipe(finalize(() => this.busy.set(null))).subscribe({ error: () => undefined });
  }
}
