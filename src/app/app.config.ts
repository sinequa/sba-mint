import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { appInitializerFn, auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';

import { routes } from '@/app/app.routes';
import { FiltersService } from '@/app/components/filters/services/filters.service';
import { SearchInputService } from '@/app/components/search-input/search-input.service';
import { RecentSearchesService, UserSettingsService } from '@/app/services';
import { eagerProvider } from '@/app/utils';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    eagerProvider(UserSettingsService),
    eagerProvider(FiltersService),
    eagerProvider(SearchInputService),
    eagerProvider(RecentSearchesService),
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
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
