import { registerLocaleData } from "@angular/common";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeFr from "@angular/common/locales/fr";
import { ApplicationConfig, LOCALE_ID, provideAppInitializer, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter, RouteReuseStrategy, withComponentInputBinding, withHashLocation } from "@angular/router";
import { provideAgent } from "@config/agent.providers";
import { provideAssistant } from "@config/assistant.providers";
import { CustomReuseStrategy } from "@config/custom-reuse-strategy";
import { provideTranslocoProviders } from "@config/transloco-providers";
import { getComponentsForDocumentType } from "@registry/document-type-registry";
import {
  auditInterceptorFn,
  authInterceptorFn,
  BOOKMARKS_CONFIG,
  BOOKMARKS_OPTIONS,
  bodyInterceptorFn,
  COLLECTIONS_CONFIG,
  COLLECTIONS_OPTIONS,
  COMPONENTS_FOR_DOCUMENT_TYPE,
  errorInterceptorFn,
  FILTERS_BREAKPOINT,
  HIGHLIGHTS,
  PREVIEW_CONFIG,
  RECENT_SEARCHES_CONFIG,
  RECENT_SEARCHES_OPTIONS,
  ROUTE_COMPONENTS,
  SAVED_SEARCHES_CONFIG,
  SAVED_SEARCHES_OPTIONS,
  toastInterceptorFn,
  bootstrapApp
} from "@sinequa/atomic-angular";
import { provideTanStackQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { PREVIEW_HIGHLIGHTS } from "../config/highlight.config";
import { SearchLayoutComponent } from "./pages/search/search.layout";
import { SearchAllComponent } from "./pages/search/search-all";
import { routes } from "./routes";

registerLocaleData(localeFr);
registerLocaleData(localeDe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        bodyInterceptorFn,
        authInterceptorFn,
        auditInterceptorFn,
        errorInterceptorFn,
        toastInterceptorFn
      ])
    ),

    // This provider is used to configure the route reuse strategy of the application.
    // By default, Angular destroys a component when navigating away from its route and re-creates it when navigating back to that route.
    // With this provider, we can tell Angular to keep the component instance in memory and reuse it when navigating back to the route.
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },

    // Signs the user in and bootstraps the application. `bootstrapApp` injects ApplicationService
    // itself AFTER resolving the auth mode (initializeAppConfig), so:
    //  - detection runs before sign-in (no bootstrap race), and
    //  - `backendUrl` is set before any service/store is constructed (no `/undefined/api/v1/...`).
    // Note: we must NOT eagerly `inject(ApplicationService)` in this factory — that would construct
    // it (and its dependent stores) before detection sets `backendUrl`.
    provideAppInitializer(() => bootstrapApp({ createRoutes: true })),

    /* assistant's providers */
    provideAssistant(),
    /* agent's providers */
    provideAgent(),

    { provide: LOCALE_ID, useValue: "fr-FR" },

    // this token is used to configure the CSS class to use in the preview with the highlights
    // for each highlight, a CSS class will be created with the name of the highlight
    { provide: HIGHLIGHTS, useValue: PREVIEW_HIGHLIGHTS },

    // this token is used to configure the function who returns the component to use for the preview
    // the function should return a DocumentTypeMap object
    {
      provide: COMPONENTS_FOR_DOCUMENT_TYPE,
      useValue: getComponentsForDocumentType
    },

    // those tokens are used to configure the path of the widgets
    // by default, the routerLink is "/xxx", where xxx is the name of the widget
    // if you want to change the path of the widget, you can use the routerLink property
    // showLoadMore is used to show the "Load more" button in the widgets, by default it is set to true, so here we set it to false
    {
      provide: RECENT_SEARCHES_CONFIG,
      useValue: {
        ...RECENT_SEARCHES_OPTIONS,
        routerLink: "/widgets/recent-searches",
        showLoadMore: false
      }
    },
    {
      provide: SAVED_SEARCHES_CONFIG,
      useValue: {
        ...SAVED_SEARCHES_OPTIONS,
        routerLink: "/widgets/saved-searches",
        showLoadMore: false
      }
    },
    {
      provide: BOOKMARKS_CONFIG,
      useValue: {
        ...BOOKMARKS_OPTIONS,
        routerLink: "/widgets/bookmarks",
        showLoadMore: false
      }
    },
    {
      provide: COLLECTIONS_CONFIG,
      useValue: {
        ...COLLECTIONS_OPTIONS,
        routerLink: "/widgets/collections",
        showLoadMore: false
      }
    },
    // this token is used to configure how the extracts will be retrieved
    // if worker is allowed by your Security Policy, the extracts will be retrieved using a web worker
    // if not, comment the line below or set it to false
    { provide: PREVIEW_CONFIG, useValue: { allowWorker: true } },

    // this token is used to configure the component to use for each path,
    // use it, if you want to use a different component for the same path
    {
      provide: ROUTE_COMPONENTS,
      useValue: [
        {
          path: "search",
          component: SearchLayoutComponent,
          isRoot: true
        },
        {
          path: "all",
          component: SearchAllComponent
        }
      ]
    },

    // this token is used to add specific aggregations to the filters bar
    // in the case of the example, we add the Money aggregation when available
    // in the search result
    // { provide: AGGREGATIONS_NAMES, useValue: ['Money', 'Companies', ...AGGREGATIONS_NAMES_PRESET_DEFAULT] },

    // this token is use to configure how many filters are displayed in the filter bar before to be moved to the "More" button
    // in the case of the example, we set the number of filters to 10, so if we have 15 filters, 10 will be displayed in the filter bar and 5 will be moved to the "More" button
    // if the space is not enough, the filters will be moved to the "More" button
    { provide: FILTERS_BREAKPOINT, useValue: 10 },

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
    // this function is used to provide the transloco providers, you can add your own providers in the function provideTranslocoProviders
    provideTranslocoProviders()
  ]
};
