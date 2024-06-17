import { Injectable, inject } from '@angular/core';
import { toast } from 'ngx-sonner';
import { getState } from '@ngrx/signals';

import { SavedSearch } from '../types/user-settings';
import { QueryParamsStore, UserSettingsStore } from '../stores';

const SAVED_SEARCHES_MAX_STORAGE = 100;

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  userSettingsStore = inject(UserSettingsStore);
  queryParamsStore = inject(QueryParamsStore);

  public getSavedSearches(): SavedSearch[] {
    return this.userSettingsStore.savedSearches()
  }

  public saveSearch() {
    const  { text } = getState(this.queryParamsStore);
    if (!text) {
      console.error('Saving empty search is not allowed');
      return;
    }

    const savedSearch = { url: window.location.hash.substring(1), date: new Date().toISOString(), display: text };
    const savedSearches = this.userSettingsStore.savedSearches();

    if (savedSearches.length >= SAVED_SEARCHES_MAX_STORAGE){
      savedSearches.pop();
    }

    savedSearches.unshift(savedSearch);

    this.userSettingsStore.updateSavedSearches(savedSearches);

    toast.success('Search successfully saved');
  }

  public updateSavedSearches(savedSearches: SavedSearch[]) {
    this.userSettingsStore.updateSavedSearches(savedSearches);
  }
}