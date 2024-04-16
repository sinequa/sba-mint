import { Injectable, Injector, inject, signal } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';

import { CCWebService, Suggestion, fetchSuggest } from '@sinequa/atomic';

import { AppStore, UserSettingsStore } from '@/app/stores';
import { getState } from '@ngrx/signals';
import { Autocomplete } from '../types';

type AutocompleteWebService = CCWebService & {
  allowedWithAnySBA?: boolean,
  revision?: number,
  suggestQueries?: string,
  useDistributionRegex?: boolean,
}

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  readonly opened = signal(false);

  readonly injector = inject(Injector)

  userSettingsStore = inject(UserSettingsStore);
  appStore = inject(AppStore);

  /**
   * Retrieves autocomplete items for the given text, max count for each
   * category handled by the service can be specified in the admin
   *
   * @param text Text to retrieve autocomplete items for
   * @returns An observable of an array of {@link Suggestion} arrays grouped by
   * suggestion queries configured in the admin
   */
  getFromSuggestQueriesForText(text: string): Observable<Suggestion[][]> {
    // Do not ask for autocomplete items if the text is empty
    if (!text) return of([]);

    const queries = (this.appStore.getWebServiceByType('Autocomplete') as AutocompleteWebService)?.suggestQueries?.split(',') ?? [];
    const obss = queries.reduce((acc, curr) => {
      acc.push(from(fetchSuggest(curr, text)));
      return acc;
    }, [] as Observable<Suggestion[]>[]);

    return forkJoin(obss);
  }

  /**
   * Retrieves autocomplete items for the given text from the user settings
   *
   * @param text Text to retrieve autocomplete items for
   * @param maxCount Maximum number of items to retrieve
   * @returns An observable of an array of {@link Suggestion} arrays grouped by
   * `recent-searches`, `saved-searches`, `bookmarks` from the user settings
   */
  getFromUserSettingsForText(text: string, maxCount?: number | Autocomplete): Suggestion[] {
    const { bookmarks, recentSearches, savedSearches } = getState(this.userSettingsStore);
    const items: Suggestion[] = [];

    if (typeof maxCount === 'number')
      maxCount = { recentSearches: maxCount, savedSearches: maxCount, bookmarks: maxCount };

    if (recentSearches) {

      // don't filter if the text is empty
      const matchingRecentSearches = text
        ? recentSearches.filter(recentSearch => recentSearch.display?.toLocaleLowerCase().includes(text.toLocaleLowerCase()))
        : recentSearches;

      const searches = matchingRecentSearches.slice(0, maxCount?.recentSearches);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'recent-search', ...search })));
    }

    if (savedSearches) {

      // don't filter if the text is empty
      const matchingSavedSearches = text
        ? savedSearches.filter(savedSearch => savedSearch.display?.toLocaleLowerCase().includes(text.toLocaleLowerCase()))
        : savedSearches;

      const searches = matchingSavedSearches.slice(0, maxCount?.savedSearches);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'saved-search', ...search })));
    }

    if (bookmarks) {

      // don't filter if the text is empty
      const matchingBookmarks = text
        ? bookmarks.filter(bookmark => bookmark.label?.toLowerCase().includes(text.toLowerCase()))
        : bookmarks;

      const searches = matchingBookmarks.slice(0, maxCount?.bookmarks);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'bookmark', display: search.label ?? '', ...search })));
    }

    return items;
  }
}
