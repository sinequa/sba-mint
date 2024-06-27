import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';

import { HIGHLIGHTS, appInitializerFn, auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';

import { toastInterceptorFn } from '@sinequa/atomic-angular';

import { routes } from '@/app/app.routes';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { TranslocoHttpLoader } from './transloco-loader';

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
    provideAnimations(),
    // set the default OAuth2 and/or SAML authentication provider
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([
      bodyInterceptorFn,
      authInterceptorFn,
      auditInterceptorFn,
      errorInterceptorFn,
      toastInterceptorFn
    ])),
    provideAngularQuery(new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          gcTime: 0
        }
      }
    })),
    provideTransloco({
      config: {
        availableLangs: ['en', 'fr'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        fallbackLang: 'en',
        missingHandler: {
          logMissingKey: true,
          useFallbackTranslation: true
        }
      },
      loader: TranslocoHttpLoader,
    }),
    provideTranslocoMessageformat()
  ]
};
