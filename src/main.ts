import { inject, runInInjectionContext } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { getState } from '@ngrx/signals';
import { focusGroupKeyUX, hiddenKeyUX, hotkeyKeyUX, jumpKeyUX, pressKeyUX, startKeyUX } from 'keyux';

import { error, info, setGlobalConfig } from '@sinequa/atomic';
import { UserSettingsStore } from '@sinequa/atomic-angular';

import atomicAngular from '../node_modules/@sinequa/atomic-angular/package.json';
import atomic from '../node_modules/@sinequa/atomic/package.json';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// datepicker i18n https://mymth.github.io/vanillajs-datepicker/#/i18n
import Datepicker from 'vanillajs-datepicker/Datepicker';
// @ts-ignore: missing types
import fr from 'vanillajs-datepicker/locales/fr';
// @ts-ignore: missing types
import de from 'vanillajs-datepicker/locales/de';
Object.assign(Datepicker.locales, fr, de);

setGlobalConfig(environment);

// applyConsoleLogLevels();

/**
 * keyux configuration
 */
startKeyUX(window, [hotkeyKeyUX(), focusGroupKeyUX(), pressKeyUX('is-pressed'), jumpKeyUX(), hiddenKeyUX()]);

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    // Set the dark mode class based on user settings
    runInInjectionContext(appRef.injector, () => {
      const { useDarkMode } = getState(inject(UserSettingsStore)) as any;
      document.documentElement.classList.toggle('dark', useDarkMode);
    });
  })
  .then(() => {
    info('atomic', atomic.version);
    info('atomic-angular', atomicAngular.version);
  })
  .catch(err => {
    // this catch is triggered when the bootstrapApplication fails, for example when the appConfig is not valid
    error('bootstrapApplication error:', err);

    localStorage.setItem('errorMessage', JSON.stringify(err));
    // Redirect to the error page with the URL causing the error
    window.location.href = 'assets/error.html';
  });
