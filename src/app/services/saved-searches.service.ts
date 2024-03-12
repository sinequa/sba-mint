import { Injectable, inject } from '@angular/core';
import { SavedSearch } from '@mint/types/articles/user-settings';
import { searchInputStore } from '../stores/search-input.store';
import { UserSettingsService } from './user-settings.service';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  private readonly userSettingsService = inject(UserSettingsService);

  public async getSavedSearches(): Promise<SavedSearch[]> {
    const { savedSearches } = await this.userSettingsService.getUserSettings();

    if (savedSearches === undefined) {
      this.userSettingsService.patchUserSettings({ savedSearches: [] });
      return [];
    }

    return savedSearches;
  }

  public async saveSearch(): Promise<void> {
    if (!searchInputStore.state) {
      console.error('Saving empty search is not allowed');
      return;
    }

    const savedSearch = { url: window.location.hash.substring(1), date: new Date().toISOString() };
    const savedSearches = await this.getSavedSearches();

    savedSearches.unshift(savedSearch);

    await this.userSettingsService.patchUserSettings({ savedSearches });
  }
}