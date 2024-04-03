import { inject, Injectable } from '@angular/core';
import { getState } from '@ngrx/signals';

import { fetchApp } from '@sinequa/atomic';

import { appStore, PrincipalStore, UserSettingsStore } from '@/app/stores';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  userSettingsStore = inject(UserSettingsStore);
  principalStore = inject(PrincipalStore);

  /**
   * Initializes the application.
   * - Fetches the application configuration.
   * - Sets the fetched application configuration in the app store.
   * - Loads the user settings and logs the state of the user settings store.
   */
  async init() {
    // Fetch the application configuration
    const app = await fetchApp();
    appStore.set(app)

    // Load the principal (user information)
    this.principalStore.initialize().then(() => console.log("principalStore", getState(this.principalStore)));

    // Load the user settings
    this.userSettingsStore.initialize().then(() => console.log("userSettingsStore", getState(this.userSettingsStore)));
  }
}