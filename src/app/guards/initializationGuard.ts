import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { globalConfig, isAuthenticated } from '@sinequa/atomic';
import { AppStore, ApplicationStore } from '../stores';

/**
 * Returns a guard function that checks if the user is authenticated.
 * If the user is not authenticated, it navigates to the login page.
 * @returns The guard function.
 */
export function InitializationGuard(): CanActivateFn {

  return (_, state) => {
    const route = inject(Router);
    const app = inject(ApplicationStore);

    /**
     * If the app is not ready, navigate to the loading page.
     * This is useful when the app is loading and the user tries to access a page that requires the app to be ready.
     *
     * We need to wait appStore, PrincipalStore and UserSettingsStore to be initialized before we can navigate to the requested page.
     *
     * @returns True if the app is ready, false otherwise.
     */
    if (!app.ready()) {
      route.navigate(['/loading'], { queryParams: { returnUrl: state.url }});
      return false;
    }
    return true;
  };
}
