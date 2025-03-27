import { BsSearchModule } from '@sinequa/components/search';
import { IntlModule, Locale, LocalesConfig } from '@sinequa/core/intl';
import { LoginModule } from '@sinequa/core/login';
import { ModalModule } from '@sinequa/core/modal';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { StartConfig, WebServicesModule } from '@sinequa/core/web-services';

import enLocale from './locales/en';
import { environment } from '../environments/environment';

export class AppLocalesConfig implements LocalesConfig {
  defaultLocale: Locale;
  locales?: Locale[];
  constructor() {
    this.locales = [{ name: 'en', display: 'msg#locale.en', data: enLocale }];
    this.defaultLocale = this.locales[0];
  }
}

let startConfig: StartConfig = { auditEnabled: true };
if (isDevMode()) {
  startConfig = {
    app: environment.app,
    autoOAuthProvider: environment.autoOAuthProvider,
    auditEnabled: true
  };
}

export const sbaProviders = [
  importProvidersFrom(WebServicesModule.forRoot(startConfig)),
  importProvidersFrom(IntlModule.forRoot(AppLocalesConfig)),
  importProvidersFrom(BsSearchModule),
  importProvidersFrom(LoginModule.forRoot()),
  importProvidersFrom(ModalModule)
];
