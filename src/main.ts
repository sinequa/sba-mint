import { bootstrapApplication } from '@angular/platform-browser';
import { focusGroupKeyUX, hiddenKeyUX, hotkeyKeyUX, jumpKeyUX, pressKeyUX, startKeyUX } from 'keyux';

import { applyConsoleLogLevels, setGlobalConfig } from '@sinequa/atomic';
import atomicAngular from '../node_modules/@sinequa/atomic-angular/package.json';
import atomic from '../node_modules/@sinequa/atomic/package.json';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

setGlobalConfig(environment);

applyConsoleLogLevels();

/**
 * keyux configuration
 */
startKeyUX(window, [hotkeyKeyUX(), focusGroupKeyUX(), pressKeyUX('is-pressed'), jumpKeyUX(), hiddenKeyUX()]);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.info('atomic', atomic.version);
    console.info('atomic-angular', atomicAngular.version);
  })
  .catch(err => {
    // this catch is triggered when the bootstrapApplication fails, for example when the appConfig is not valid
    console.error('bootstrapApplication error:', err);

    localStorage.setItem('errorMessage', JSON.stringify(err));
    // Redirect to the error page with the URL causing the error
    window.location.href = '/assets/error.html';
  });
