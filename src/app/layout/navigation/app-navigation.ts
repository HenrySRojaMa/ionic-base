import { NavItem } from './nav-item.model';

/**
 * Menú de la aplicación (menú lateral). Cada proyecto lo adapta aquí.
 * Los íconos son nombres de ionicons registrados en MainLayout.
 */
export const APP_NAVIGATION: NavItem[] = [
  { label: 'Inicio', path: '/', icon: 'home-outline' },
  { label: 'Showcase', path: '/showcase', icon: 'apps-outline' },
];
