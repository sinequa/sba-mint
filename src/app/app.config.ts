import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { HIGHLIGHTS, appInitializerFn, auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';

import { routes } from '@/app/app.routes';
import { SearchInputService } from './components/search-input/search-input.service';
import { QueryParamsService } from './services';
import { eagerProvider } from './utils';
import { queryNameInterceptorFn } from './utils/queryname.interceptor';

registerLocaleData(localeFr);


const PREVIEW_HIGHLIGHTS = [
  {
      name: 'company',
      color: 'white',
      bgColor: '#FF7675'
  },
  {
      name: 'geo',
      color: 'white',
      bgColor: '#74B9FF'
  },
  {
      name: 'person',
      color: 'white',
      bgColor: '#00ABB5'
  },
  {
      name: 'extractslocations',
      color: 'black',
      bgColor: '#fffacd'
  },
  {
      name: 'matchlocations',
      color: 'black',
      bgColor: '#ff0'
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    // set the default OAuth2 and/or SAML authentication provider
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS},
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    eagerProvider(QueryParamsService),
    eagerProvider(SearchInputService),
    provideHttpClient(withInterceptors([
      bodyInterceptorFn,
      authInterceptorFn,
      auditInterceptorFn,
      errorInterceptorFn,
      queryNameInterceptorFn
    ]))
  ]
};
