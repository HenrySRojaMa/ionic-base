/**
 * Forma que deben cumplir TODOS los archivos de entorno.
 * Si se agrega una propiedad aquí, TypeScript obliga a definirla en cada
 * environment*.ts, así nunca quedan desincronizados.
 */
export interface AppEnvironment {
  production: boolean;
  /** URL base de la API. Termina en "/" y las rutas de los servicios no empiezan con "/". */
  apiUrl: string;
  auth: {
    loginUrl: string;
    refreshUrl: string;
    logoutUrl: string;
  };
  /**
   * Activa un backend simulado dentro del navegador (core/mock).
   * Permite ejecutar la base sin servidor. Nunca debe estar activo en producción.
   */
  mockApi: boolean;
}
