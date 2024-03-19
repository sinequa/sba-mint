import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { isASearchRoute } from '@/app/app.routes';
import { NavigationService, UserSettingsService } from '@/app/services';
import { searchInputStore } from '@/app/stores';
import { RecentSearch, UserSettings } from '@/app/types';
import { getQueryTextFromUrl } from '@/app/utils';

const RECENT_SEARCHES_MAX_STORAGE = 50;

@Injectable({
  providedIn: 'root'
})
export class RecentSearchesService implements OnDestroy {
  private readonly navigationService = inject(NavigationService);
  private readonly userSettingsService = inject(UserSettingsService);

  private readonly subscription = new Subscription();

  constructor() {
    this.navigationService.navigationEnd$
      .pipe(
        filter((event: RouterEvent) => isASearchRoute(event.url))
      )
      .subscribe(() => this.userSettingsService.getUserSettings().then(result => this.saveSearch(result)));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async getRecentSearches(): Promise<RecentSearch[]> {
    const { recentSearches } = await this.userSettingsService.getUserSettings();

    if (recentSearches === undefined) {
      this.userSettingsService.patchUserSettings({ recentSearches: [] });
      return [];
    }

    return recentSearches;
  }

  public async saveSearch(result: UserSettings): Promise<void> {
    if (!searchInputStore.state) {
      console.log('Avoid saving empty search');
      return;
    }

    let recentSearches = result.recentSearches;
    let currentSearch: RecentSearch | undefined = undefined;

    if (recentSearches === undefined)
      recentSearches = [];
    // Override the first recent search if search text is the same as the current search
    else if (recentSearches.length > 0 && getQueryTextFromUrl(recentSearches[0]?.url || '').trim() === searchInputStore.state.trim()) {
      currentSearch = recentSearches.shift();
      currentSearch!.url = window.location.hash.substring(1);
      currentSearch!.date = new Date().toISOString();
    }
    else if (recentSearches.length >= RECENT_SEARCHES_MAX_STORAGE)
      recentSearches.pop();

    // Save only the hash part of the URL with the #
    if (currentSearch === undefined)
      currentSearch = { url: window.location.hash.substring(1), date: new Date().toISOString(), display: searchInputStore.state };

    recentSearches.unshift(currentSearch);

    await this.userSettingsService.patchUserSettings({ recentSearches });
  }
}