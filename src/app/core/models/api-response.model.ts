/**
 * Sobre estándar con el que responde la API.
 * Si el backend usa otra forma, este es el único lugar que hay que adaptar.
 */
export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

/** Forma del cuerpo de error que devuelve la API (puede venir incompleto). */
export interface ApiErrorBody {
  code?: string;
  message?: string;
}
