import { Injectable } from '@angular/core';
import { UserSettings } from '@mint/types/articles/user-settings';
import { fetchUserSettings, patchUserSettings } from '@sinequa/atomic';
import { searchInputStore } from '../stores/search-input.store';

const SAVED_SEARCHES_MAX_STORAGE = 10;

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  public saveSearch(): void {
    if (!searchInputStore.state) {
      console.log('Avoid saving empty search');
      return;
    }

    fetchUserSettings().then((result: UserSettings) => {
      let savedSearches = result.savedSearches;

      if (savedSearches === undefined)
        savedSearches = [];
      else if (savedSearches.length >= SAVED_SEARCHES_MAX_STORAGE)
        savedSearches.pop();

      // Save only the hash part of the URL with the #
      savedSearches.unshift({ url: window.location.hash.substring(1) });

      patchUserSettings({ savedSearches });
    })
  }
}