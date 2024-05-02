import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subscription, filter } from 'rxjs';

import { isASearchRoute } from '@/app/app.routes';
import { NavigationService } from '@/app/services';
import { UserSettingsStore, searchInputStore } from '@/app/stores';
import { RecentSearch } from '@/app/types/user-settings';
import { getQueryParamsFromUrl, getQueryTextFromUrl } from '@/app/utils';

const RECENT_SEARCHES_MAX_STORAGE = 50;

@Injectable({
  providedIn: 'root'
})
export class RecentSearchesService implements OnDestroy {
  private readonly navigationService = inject(NavigationService);
  store = inject(UserSettingsStore);

  private readonly subscription = new Subscription();

  constructor() {
    this.navigationService.navigationEnd$
      .pipe(
        filter((event: RouterEvent) => isASearchRoute(event.url))
      )
      .subscribe(() => {
        const state = this.store.recentSearches();
        if (state) {
          this.saveSearch(state);
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Retrieves the recent searches from the store and transforms them into an array of RecentSearch objects.
   * @returns An array of RecentSearch objects.
   */
  public getRecentSearches(): RecentSearch[] {
    return this.store.recentSearches().reduce((acc, recentSearch) => {
      const queryParams = getQueryParamsFromUrl(recentSearch.url);

      acc.push(
        Object.assign(recentSearch, {
          label: queryParams?.text || '',
          filterCount: queryParams?.filters?.length || 0,
          date: recentSearch.date,
          queryParams
        })
      );

      return acc;
    }, [] as RecentSearch[]);
  }

  public saveSearch(recentSearches: RecentSearch[]) {
    if (!searchInputStore.state) {
      toast.warning('Avoid saving empty search', { duration: 2000 });
      return;
    }

    let currentSearch: RecentSearch | undefined = undefined;

    if (recentSearches.length > 0 && getQueryTextFromUrl(recentSearches[0]?.url || '').trim() === searchInputStore.state.trim()) {
      currentSearch = recentSearches.shift();
      currentSearch!.url = window.location.hash.substring(1);
      currentSearch!.date = new Date().toISOString();
    }
    else if (recentSearches.length >= RECENT_SEARCHES_MAX_STORAGE){
      recentSearches.pop();
    }

    // Save only the hash part of the URL with the #
    if (currentSearch === undefined && searchInputStore.state !== 'undefined'){
      currentSearch = { url: window.location.hash.substring(1), date: new Date().toISOString(), display: searchInputStore.state };
    }

    if(currentSearch) {
      recentSearches.unshift(currentSearch);
    }

    this.store.updateRecentSearches(recentSearches);
  }
}