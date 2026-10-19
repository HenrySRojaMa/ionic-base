import { Service, computed, signal } from '@angular/core';
import { Session } from './auth.models';

/**
 * Estado de la sesión: única fuente de verdad sobre quién está autenticado.
 *
 * Con signals (en la base legacy era un BehaviorSubject):
 * - session() se lee como una función, en plantillas y en código.
 * - El estado derivado se declara con computed(): se recalcula solo cuando
 *   cambia la sesión y nadie tiene que suscribirse ni desuscribirse.
 * - asReadonly(): desde fuera solo se lee; se cambia con start()/clear().
 *
 * Decisión de seguridad (igual que en legacy): el access token vive SOLO en
 * memoria. Al recargar, la sesión se recupera con el refresh token (cookie HttpOnly).
 */
@Service()
export class SessionService {
  private readonly state = signal<Session | null>(null);

  readonly session = this.state.asReadonly();
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly accessToken = computed(() => this.state()?.accessToken ?? null);
  readonly user = computed(() => this.state()?.user ?? null);

  start(session: Session): void {
    this.state.set(session);
  }

  clear(): void {
    this.state.set(null);
  }
}
