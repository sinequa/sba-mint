import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  InjectionToken,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query-experimental';

import { appInitializerFn } from '@sinequa/atomic';
import {
  AGGREGATIONS_NAMES,
  AGGREGATIONS_NAMES_PRESET_DEFAULT,
  BOOKMARKS_CONFIG,
  BOOKMARKS_OPTIONS,
  COLLECTIONS_CONFIG,
  COLLECTIONS_OPTIONS,
  COMPONENTS_FOR_DOCUMENT_TYPE,
  DRAWER_COMPONENT,
  DrawerPreviewComponent,
  HIGHLIGHTS,
  PREVIEW_CONFIG,
  RECENT_SEARCHES_CONFIG,
  RECENT_SEARCHES_OPTIONS,
  ROUTE_COMPONENTS,
  SAVED_SEARCHES_CONFIG,
  SAVED_SEARCHES_OPTIONS,
  auditInterceptorFn,
  authInterceptorFn,
  bodyInterceptorFn,
  errorInterceptorFn,
  signIn,
  toastInterceptorFn
} from '@sinequa/atomic-angular';

import { PREVIEW_HIGHLIGHTS } from './highlight.config';
import { SearchAllComponent } from './pages/search/all/search-all.component';
import { SearchLayoutComponent } from './pages/search/layout';
import { getComponentsForDocumentType } from './registry/document-type-registry';
import { routes } from './routes';
import { TranslocoHttpLoader } from './transloco-loader';
import { APP_FEATURES } from './tokens';

// @ts-ignore
import Flow from '@flowjs/flow.js';
import { FlowInjectionToken } from '@flowjs/ngx-flow';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([bodyInterceptorFn, authInterceptorFn, auditInterceptorFn, errorInterceptorFn, toastInterceptorFn])),

    // set the default OAuth2 and/or SAML authentication provider
    provideAppInitializer(appInitializerFn),
    provideAppInitializer(() => signIn(inject(Router))),

    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },
    { provide: COMPONENTS_FOR_DOCUMENT_TYPE, useValue: getComponentsForDocumentType },
    { provide: DRAWER_COMPONENT, useValue: DrawerPreviewComponent },
    { provide: RECENT_SEARCHES_CONFIG, useValue: { ...RECENT_SEARCHES_OPTIONS, routerLink: '/widgets/recent-searches', showLoadMore: false } },
    { provide: SAVED_SEARCHES_CONFIG, useValue: { ...SAVED_SEARCHES_OPTIONS, routerLink: '/widgets/saved-searches', showLoadMore: false } },
    { provide: BOOKMARKS_CONFIG, useValue: { ...BOOKMARKS_OPTIONS, routerLink: '/widgets/bookmarks', showLoadMore: false } },
    { provide: COLLECTIONS_CONFIG, useValue: { ...COLLECTIONS_OPTIONS, routerLink: '/widgets/collections', showLoadMore: false } },
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

    { provide: APP_FEATURES, useValue: { assistant: { usePrefixName: false } } },

    { provide: FlowInjectionToken, useValue: Flow },

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
