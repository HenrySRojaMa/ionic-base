import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { provideCore } from '@core/core.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Ionic 9: provideIonicAngular() reemplaza a IonicModule.forRoot() (deprecado).
    // Los componentes se importan uno a uno desde '@ionic/angular' (standalone por defecto).
    // useSetInputAPI: Ionic pasa componentProps con setInput() (compatible con input()
    // con signals). Sin esto usaría Object.assign y pisaría el signal del input.
    provideIonicAngular({ useSetInputAPI: true }),
    provideCore(),
    provideRouter(routes),
  ],
};
