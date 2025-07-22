import { runInInjectionContext } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { focusGroupKeyUX, hiddenKeyUX, hotkeyKeyUX, jumpKeyUX, pressKeyUX, startKeyUX } from 'keyux';

import { error, info, setGlobalConfig } from '@sinequa/atomic';

import atomicAngular from '../node_modules/@sinequa/atomic-angular/package.json';
import atomic from '../node_modules/@sinequa/atomic/package.json';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

setGlobalConfig(environment);

// applyConsoleLogLevels();

/**
 * keyux configuration
 */
startKeyUX(window, [hotkeyKeyUX(), focusGroupKeyUX(), pressKeyUX('is-pressed'), jumpKeyUX(), hiddenKeyUX()]);

bootstrapApplication(AppComponent, appConfig)
  .then(appRef => {
    runInInjectionContext(appRef.injector, () => {
      // const { useDarkMode } = getState(inject(UserSettingsStore)) as any;
      // console.log('DarkMode:', useDarkMode);

      // if (useDarkMode) document.documentElement.classList.add('dark');
      if (Boolean(localStorage.getItem('use-dark-mode'))) document.documentElement.classList.add('dark');
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
