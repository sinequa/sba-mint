import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';
import { QueryClient, provideAngularQuery } from '@tanstack/angular-query-experimental';

import { HIGHLIGHTS, appInitializerFn, auditInterceptorFn, authInterceptorFn, bodyInterceptorFn, errorInterceptorFn } from '@sinequa/atomic-angular';
import { IntlModule, Locale, LocalesConfig } from '@sinequa/core/intl';

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

import { BsSearchModule } from '@sinequa/components/search';
import { LoginModule } from '@sinequa/core/login';
import { ModalModule } from '@sinequa/core/modal';
import { StartConfig, StartConfigWebService, WebServicesModule } from '@sinequa/core/web-services';
import { environment } from '@/environments/environment';
import enLocale from './locales/en';
export class AppLocalesConfig implements LocalesConfig {
  defaultLocale: Locale;
  locales?: Locale[];
  constructor(){
      this.locales = [
          { name: "en", display: "msg#locale.en", data: enLocale }
      ];
      this.defaultLocale = this.locales[0];
  }
}
export function StartConfigInitializer(startConfigWebService: StartConfigWebService) {
  return () => startConfigWebService.fetchPreLoginAppConfig();
}

export const startConfig: StartConfig = {
  app: environment.app,
  autoOAuthProvider: environment.autoOAuthProvider
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(WebServicesModule.forRoot(startConfig)),
    importProvidersFrom(IntlModule.forRoot(AppLocalesConfig)),
    importProvidersFrom(BsSearchModule),
    importProvidersFrom(LoginModule.forRoot()),
    importProvidersFrom(ModalModule),
    // { provide: LoginService, useClass: myLoginService },

    { provide: APP_INITIALIZER, useFactory: StartConfigInitializer, deps: [StartConfigWebService], multi: true },
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
    ])),
    provideAngularQuery(new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          gcTime:0
        }
      }
    }))
  ]
};
