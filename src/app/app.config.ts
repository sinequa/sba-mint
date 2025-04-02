import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, isDevMode, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query-experimental';

import { appInitializerFn } from '@sinequa/atomic';
import {
  AGGREGATIONS_NAMES,
  AGGREGATIONS_NAMES_PRESET_DEFAULT,
  COMPONENTS_FOR_DOCUMENT_TYPE,
  DRAWER_COMPONENT,
  DrawerPreviewComponent,
  HIGHLIGHTS,
  PREVIEW_CONFIG,
  ROUTE_COMPONENTS,
  auditInterceptorFn,
  authInterceptorFn,
  bodyInterceptorFn,
  signIn,
  toastInterceptorFn
} from '@sinequa/atomic-angular';

import { PREVIEW_HIGHLIGHTS } from './highlight.config';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchLayoutComponent } from './pages/search/search.layout';
import { getComponentsForDocumentType } from './registry/document-type-registry';
import { routes } from './routes';
import { sbaProviders } from './sba.config';
import { TranslocoHttpLoader } from './transloco-loader';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([bodyInterceptorFn, authInterceptorFn, auditInterceptorFn, toastInterceptorFn])),

    // set the default OAuth2 and/or SAML authentication provider
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
    { provide: APP_INITIALIZER, useFactory: (router: Router) => () => signIn(router), deps: [Router], multi: true },

    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },
    { provide: COMPONENTS_FOR_DOCUMENT_TYPE, useValue: getComponentsForDocumentType },
    { provide: DRAWER_COMPONENT, useValue: DrawerPreviewComponent },
    { provide: PREVIEW_CONFIG, useValue: { allowWorker: true } },
    {
      provide: ROUTE_COMPONENTS,
      useValue: [
        {
          path: 'search',
          component: SearchLayoutComponent,
          isRoot: true
        },
        {
          path: 'all',
          component: SearchAllComponent
        }
      ]
    },
    { provide: AGGREGATIONS_NAMES, useValue: [...AGGREGATIONS_NAMES_PRESET_DEFAULT, 'Money'] },

    provideTanStackQuery(
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            gcTime: 0,
            retry() {
              return false;
            }
          }
        }
      })
    ),
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
      loader: TranslocoHttpLoader
    }),
    provideTranslocoMessageformat(),

    // legacy providers from SBA dependencies
    ...sbaProviders
  ]
};
