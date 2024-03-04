import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';
import { routes } from './app.routes';
import { FiltersService } from './components/filters/filters.service';
import { SearchInputService } from './components/search-input/search-input.service';
import { eagerProvider } from './utils/eager-provider';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    eagerProvider(FiltersService),
    eagerProvider(SearchInputService),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([
      bodyInterceptorFn,
      authInterceptorFn,
      auditInterceptorFn,
      errorInterceptorFn
    ]))
  ]
};
