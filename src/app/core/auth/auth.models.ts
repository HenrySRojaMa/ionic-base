/** Datos mínimos del usuario autenticado que necesita la infraestructura. */
export interface SessionUser {
  id: number | string;
  displayName: string;
}

export interface Session {
  accessToken: string;
  user: SessionUser;
  /**
   * Solo para clientes nativos: en la web el refresh token es una cookie
   * HttpOnly y nunca llega a JavaScript. AuthApi lo guarda y lo quita del
   * objeto antes de entregar la sesión.
   */
  refreshToken?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

/** Le indica al backend cómo entregar el refresh token. */
export type ClientKind = 'web' | 'native';
