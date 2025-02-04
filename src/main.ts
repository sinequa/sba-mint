import { bootstrapApplication } from '@angular/platform-browser';
import { setGlobalConfig } from '@sinequa/atomic';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

import { focusGroupKeyUX, hiddenKeyUX, hotkeyKeyUX, jumpKeyUX, pressKeyUX, startKeyUX } from 'keyux';
import atomicAngular from "../node_modules/@sinequa/atomic-angular/package.json";
import atomic from "../node_modules/@sinequa/atomic/package.json";

setGlobalConfig(environment);

/**
 * keyux configuration
 */
startKeyUX(window, [
  hotkeyKeyUX(),
  focusGroupKeyUX(),
  pressKeyUX('is-pressed'),
  jumpKeyUX(),
  hiddenKeyUX()
]);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log("atomic", atomic.version);
    console.log("atomic-angular", atomicAngular.version);
  })
  .catch((err) => {
    console.error("bootstrapApplication error:", err);
    parseResponse(err);
    const currentUrl = encodeURIComponent(err.url);
    // Redirect to the error page with the URL causing the error
    window.location.href = `/assets/error.html?url=${currentUrl}`;
  });

/**
 * Parses the response error and sets the error message in the local storage.
 *
 * @param err - The response error object.
 * @returns void
 */
async function parseResponse(err: Response) {
  let errorMessage = err.statusText || err.toString();

  if (err && err.body) {
    try {
      const reader = err.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          result += decoder.decode(value, { stream: !done });
        }
      }

      errorMessage = result || errorMessage;
    } catch (streamError) {
      console.error("Error reading stream", streamError);
    }
  }

  localStorage.setItem('errorMessage', errorMessage);
}