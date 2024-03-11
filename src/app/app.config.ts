import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';

import { routes } from '@/app/app.routes';
import { FiltersService } from '@/app/components/filters/services/filters.service';
import { SearchInputService } from '@/app/components/search-input/search-input.service';
import { eagerProvider } from '@/app/utils';

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
