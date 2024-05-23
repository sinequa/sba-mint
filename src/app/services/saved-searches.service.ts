import { Injectable, inject } from '@angular/core';
import { searchInputStore } from '../stores/search-input.store';
import { SavedSearch } from '../types/user-settings';
import { UserSettingsStore } from '../stores';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  store = inject(UserSettingsStore);

  public getSavedSearches(): SavedSearch[] {
    return this.store.savedSearches()
  }

  public saveSearch() {
    if (!searchInputStore.state) {
      console.error('Saving empty search is not allowed');
      return;
    }

    const savedSearch = { url: window.location.hash.substring(1), date: new Date().toISOString(), display: searchInputStore.state };
    const savedSearches = this.store.savedSearches();

    savedSearches.unshift(savedSearch);

    this.store.updateSavedSearches(savedSearches);

    toast.success('Search successfully saved');
  }

  public updateSavedSearches(savedSearches: SavedSearch[]) {
    this.store.updateSavedSearches(savedSearches);
  }
}