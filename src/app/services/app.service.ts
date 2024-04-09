import { inject, Injectable } from '@angular/core';
import { getState } from '@ngrx/signals';


import { AppStore, PrincipalStore, UserSettingsStore } from '@/app/stores';
import { AppService } from '@sinequa/atomic-angular';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  userSettingsStore = inject(UserSettingsStore);
  principalStore = inject(PrincipalStore);

  appService = inject(AppService);
  appStore = inject(AppStore);

  /**
   * Initializes the application.
   * - Fetches the application configuration.
   * - Sets the fetched application configuration in the app store.
   * - Loads the user settings and logs the state of the user settings store.
   */
  async init() {
    // Fetch the application configuration
    await this.appStore.initialize().then(() => console.log("appStore", getState(this.appStore)));

    // Load the principal (user information)
    await this.principalStore.initialize().then(() => console.log("principalStore", getState(this.principalStore)));

    // Load the user settings
    await this.userSettingsStore.initialize().then(() => console.log("userSettingsStore", getState(this.userSettingsStore)));
  }
}