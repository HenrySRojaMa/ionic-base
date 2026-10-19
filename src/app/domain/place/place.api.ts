import { HttpContext, HttpResourceRef, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { ApiService } from '@core/http/api.service';
import { DIALOG_OPTIONS } from '@core/http/http-context.tokens';
import { ApiResponse } from '@core/models/api-response.model';
import { Place } from './place.models';

/**
 * Acceso a la API de la entidad Place (patrón de la capa domain).
 *
 * Legacy: getAll(): Observable<Place[]> + async pipe (o subscribe) en la página.
 * Moderno: httpResource(), que expone la petición como ESTADO con signals:
 *   value(), isLoading(), error() y reload(). Pasa por los interceptores igual
 *   que cualquier petición de HttpClient (aquí con el diálogo de error activado).
 *
 * Un resource debe crearse dentro de un contexto de inyección: se llama desde
 * un campo del componente que lo usa, y vive mientras viva ese componente.
 */
@Service()
export class PlaceApi {
  private readonly api = inject(ApiService);

  allResource(): HttpResourceRef<Place[]> {
    return httpResource<Place[]>(
      () => ({
        url: this.api.url('demo/places'),
        context: new HttpContext().set(DIALOG_OPTIONS, { error: true }),
      }),
      {
        parse: (raw) => (raw as ApiResponse<Place[]>).data,
        defaultValue: [],
      },
    );
  }
}
