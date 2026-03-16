import { registerLocaleData } from "@angular/common";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeFr from "@angular/common/locales/fr";
import { APP_INITIALIZER, type ApplicationConfig, inject, isDevMode, LOCALE_ID, provideAppInitializer, provideZonelessChangeDetection } from "@angular/core";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withComponentInputBinding, withHashLocation } from "@angular/router";
import { TranslocoHttpLoader } from "@config/transloco-loader";
// @ts-expect-error
import Flow from "@flowjs/flow.js";
import { FlowInjectionToken } from "@flowjs/ngx-flow";
import { provideTransloco } from "@jsverse/transloco";
import { provideTranslocoMessageformat } from "@jsverse/transloco-messageformat";
import { getComponentsForDocumentType } from "@registry/document-type-registry";
import { provideDefaultRendererPlugins, provideDefaultShikiHighlighterConfig, provideDefaultToolCardPlugins } from "@sinequa/agent";
import {
  ASSISTANT_CUSTOM_ELEMENTS,
  ASSISTANT_MARKDOWN_IT_PLUGINS,
  CustomElementsService,
  DocumentReferenceComponent,
  ImageReferenceComponent,
  initializeCustomElements,
  markdownItCodeBlockPlugin,
  markdownItDocumentReferencePlugin,
  markdownItImageReferencePlugin,
  markdownItLinkPlugin,
  markdownItPageReferencePlugin,
  markdownItTableToolsPlugin,
  PageReferenceComponent,
  TableToolsComponent
} from "@sinequa/assistant/chat";
import { appInitializerFn } from "@sinequa/atomic";
import {
  ApplicationService,
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
  withBootstrapApp
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
    provideNoopAnimations(), // used by the Assistant components
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideHttpClient(withInterceptors([bodyInterceptorFn, authInterceptorFn, auditInterceptorFn, errorInterceptorFn, toastInterceptorFn])),

    // this function is used to configure the application before it is loaded
    provideAppInitializer(appInitializerFn),

    // this function is used to sign in the user and bootstrap the application
    provideAppInitializer(() => withBootstrapApp(inject(ApplicationService), { createRoutes: true })),

    // Provide default agent renderer plugins (code-block, links, references, ...)
    provideDefaultRendererPlugins(),

    // Provide default shiki highlighter configuration
    provideDefaultShikiHighlighterConfig(),

    // Provide default tool card plugins (tool-card, tool-card-error, ...)
    provideDefaultToolCardPlugins(),

    // Provides an APP_INITIALIZER which will initialize the custom elements defined in the @sinequa/assistant/chat
    // library. This is required to be able to use the custom elements in Angular components templates.
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCustomElements,
      multi: true,
      deps: [CustomElementsService]
    },

    // Assistant custom elements and markdown-it plugins configuration
    {
      provide: ASSISTANT_CUSTOM_ELEMENTS,
      useValue: {
        "document-reference": DocumentReferenceComponent,
        "page-reference": PageReferenceComponent,
        "image-reference": ImageReferenceComponent,
        // 'code-block': CodeBlockComponent,
        "table-tools": TableToolsComponent
      }
    },
    {
      provide: ASSISTANT_MARKDOWN_IT_PLUGINS,
      useValue: [
        markdownItDocumentReferencePlugin,
        markdownItPageReferencePlugin,
        markdownItImageReferencePlugin,
        markdownItLinkPlugin,
        markdownItCodeBlockPlugin,
        markdownItTableToolsPlugin
      ]
    },

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

    // used by the upload Assistant service
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
        availableLangs: ["en", "fr", "de"],
        defaultLang: "en",
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        fallbackLang: "en",
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
