import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, isDevMode, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
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
  ROUTE_COMPONENTS,
  auditInterceptorFn,
  authInterceptorFn,
  bodyInterceptorFn,
  errorInterceptorFn,
  toastInterceptorFn
} from '@sinequa/atomic-angular';

import { routes } from './routes';
import { PREVIEW_HIGHLIGHTS } from './highlight.config';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchLayoutComponent } from './pages/search/search.layout';
import { sbaProviders } from './sba.config';
import { TranslocoHttpLoader } from './transloco-loader';
import { getComponentsForDocumentType } from './registry/document-type-registry';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideExperimentalZonelessChangeDetection(),
    ...sbaProviders,
    // set the default OAuth2 and/or SAML authentication provider
    { provide: APP_INITIALIZER, useFactory: () => appInitializerFn, multi: true },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },
    { provide: COMPONENTS_FOR_DOCUMENT_TYPE, useValue: getComponentsForDocumentType },
    { provide: DRAWER_COMPONENT, useValue: DrawerPreviewComponent },
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
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([bodyInterceptorFn, authInterceptorFn, auditInterceptorFn, errorInterceptorFn, toastInterceptorFn])),
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
    provideTranslocoMessageformat()
  ]
};
