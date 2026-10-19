/**
 * Entidad de EJEMPLO para el showcase (catálogo jerárquico país > provincia > ciudad).
 * Muestra cómo se organiza una entidad en la capa domain. Se borra junto con el showcase.
 */
export interface Place {
  id: number;
  name: string;
  children?: Place[];
}
