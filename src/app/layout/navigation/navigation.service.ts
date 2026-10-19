import { Service, computed, inject } from '@angular/core';
import { SessionService } from '@core/auth/session.service';
import { NavItem } from './nav-item.model';
import { APP_NAVIGATION } from './app-navigation';

/**
 * Ítems de menú visibles según la sesión.
 *
 * Legacy: combineLatest([of(APP_NAVIGATION), session.isAuthenticated$]).pipe(map(...))
 * Moderno: computed() que lee el signal de la sesión. Se recalcula solo cuando
 * cambia isAuthenticated(), sin operadores ni suscripciones.
 */
@Service()
export class NavigationService {
  private readonly session = inject(SessionService);

  readonly items = computed(() => visibleItems(APP_NAVIGATION, this.session.isAuthenticated()));
}

export function visibleItems(items: NavItem[], authenticated: boolean): NavItem[] {
  return items
    .filter((item) => authenticated || !item.requiresAuth)
    .map((item) =>
      item.children ? { ...item, children: visibleItems(item.children, authenticated) } : item,
    );
}
