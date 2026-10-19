export interface NavItem {
  label: string;
  /** Ruta absoluta. Se omite en los ítems que solo agrupan hijos. */
  path?: string;
  /** Nombre de un ícono de ionicons (registrado en el layout con addIcons). */
  icon?: string;
  /** Solo se muestra con sesión iniciada. */
  requiresAuth?: boolean;
  children?: NavItem[];
}
