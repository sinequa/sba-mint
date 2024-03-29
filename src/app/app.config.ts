import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { appInitializerFn, auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';

import { routes } from '@/app/app.routes';
import { SearchInputService } from './components/search-input/search-input.service';
import { QueryParamsService } from './services';
import { eagerProvider } from './utils';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    // set the default OAuth2 and/or SAML authentication provider
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    eagerProvider(QueryParamsService),
    eagerProvider(SearchInputService),
    provideHttpClient(withInterceptors([
      bodyInterceptorFn,
      authInterceptorFn,
      auditInterceptorFn,
      errorInterceptorFn
    ]))
  ]
};
