import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { DIALOG_OPTIONS, DialogOptions, SKIP_AUTH } from './http-context.tokens';

type ParamValue = string | number | boolean;

/** Parámetros de query. null/undefined se omiten; los arreglos se repiten (?id=1&id=2). */
export type QueryParams = Record<string, ParamValue | readonly ParamValue[] | null | undefined>;

export interface RequestOptions extends DialogOptions {
  body?: unknown;
  params?: QueryParams;
  /** La petición no lleva token ni dispara el refresh (login, endpoints públicos). */
  skipAuth?: boolean;
  /** Envía cookies (necesario para el refresh token en cookie HttpOnly). */
  withCredentials?: boolean;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Fachada sobre HttpClient con opciones por petición ({ body, params, success,
 * error, custom }) que se traducen a un HttpContext. El trabajo transversal
 * (token, refresh, diálogos) vive en los interceptores.
 *
 * @Service() (Angular 22) reemplaza a @Injectable({ providedIn: 'root' }) y las
 * dependencias se obtienen con inject() en lugar del constructor.
 */
@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('GET', url, options);
  }

  post<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('POST', url, options);
  }

  put<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('PUT', url, options);
  }

  patch<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('PATCH', url, options);
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.request<T>('DELETE', url, options);
  }

  /** URL absoluta de un endpoint (útil para httpResource, que recibe la URL directamente). */
  url(path: string): string {
    return this.baseUrl + path;
  }

  private request<T>(method: HttpMethod, url: string, options: RequestOptions = {}): Observable<T> {
    const { body, params, skipAuth = false, withCredentials = false, ...dialog } = options;

    const context = new HttpContext().set(DIALOG_OPTIONS, dialog).set(SKIP_AUTH, skipAuth);

    return this.http.request<T>(method, this.baseUrl + url, {
      body,
      params: toHttpParams(params),
      context,
      withCredentials,
    });
  }
}

export function toHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();
  if (!params) return httpParams;

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) httpParams = httpParams.append(key, String(item));
    } else {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}
