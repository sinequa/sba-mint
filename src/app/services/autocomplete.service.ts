import { Injectable, Injector, inject, signal } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';

import { CCWebService, Suggestion, fetchSuggest } from '@sinequa/atomic';

import { UserSettingsStore, appStore } from '@/app/stores';
import { getState } from '@ngrx/signals';

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

    const queries = (appStore.getWebServiceByType('Autocomplete') as AutocompleteWebService)?.suggestQueries?.split(',') ?? [];
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
  getFromUserSettingsForText(text: string, maxCount?: number): Observable<Suggestion[]> {
    const { bookmarks, recentSearches, savedSearches } = getState(this.userSettingsStore);
    const items: Suggestion[] = [];

    if (recentSearches) {
      const searches = recentSearches
        .filter(recentSearch => recentSearch.display?.toLocaleLowerCase().includes(text.toLocaleLowerCase()))
        .slice(0, maxCount);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'recent-search', ...search })).slice(0, maxCount));
    }

    if (savedSearches) {
      const searches = savedSearches
        .filter(savedSearch => savedSearch.display?.toLocaleLowerCase().includes(text.toLocaleLowerCase()))
        .slice(0, maxCount);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'saved-search', ...search })));
    }

    if (bookmarks) {
      const searches = bookmarks
        .filter(bookmark => bookmark.label?.toLowerCase().includes(text.toLowerCase()))
        .slice(0, maxCount);

      if (searches.length > 0)
        items.push(...searches.map(search => ({ category: 'bookmark', display: search.label ?? '', ...search })));
    }

    return of(items);
  }
}
