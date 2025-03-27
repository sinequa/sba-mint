import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'src/assets/i18n/',
  langs: ['en', 'fr'],
  keysManager: {},
  scopedLibs: [
    {
      src: '@sinequa/atomic-angular',
      dist: ['src/assets/i18n']
    }
  ]
};

export default config;
