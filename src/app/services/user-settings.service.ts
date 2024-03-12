import { Injectable } from '@angular/core';
import { deleteUserSettings, fetchUserSettings, patchUserSettings, saveUserSettings } from '@sinequa/atomic';
import { userSettingsStore } from '../stores/user-settings.store';
import { UserSettings } from '../types/user-settings';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {
  public async getUserSettings(): Promise<UserSettings> {
    if (userSettingsStore.state === undefined) {
      const userSettings = await fetchUserSettings();

      userSettingsStore.set(userSettings ?? {});
    }

    return Promise.resolve(userSettingsStore.state!);
  }

  public async saveUserSettings(userSettings: UserSettings): Promise<void> {
    await saveUserSettings(userSettings);

    userSettingsStore.set(userSettings);

    return Promise.resolve();
  }

  public async patchUserSettings(userSettings: Partial<UserSettings>): Promise<void> {
    await patchUserSettings(userSettings);

    userSettingsStore.set(Object.assign({}, userSettingsStore.state, userSettings));

    return Promise.resolve();
  }

  public async deleteUserSettings(): Promise<void> {
    await deleteUserSettings();

    userSettingsStore.set({});

    return Promise.resolve();
  }
}
