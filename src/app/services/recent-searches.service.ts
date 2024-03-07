import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { UserSettings } from '@mint/types/articles/user-settings';
import { fetchUserSettings, patchUserSettings } from '@sinequa/atomic';
import { Subscription, filter } from 'rxjs';
import { isASearchRoute } from '../app.routes';
import { searchInputStore } from '../stores/search-input.store';
import { NavigationService } from './navigation.service';

const RECENT_SEARCHES_MAX_STORAGE = 10;

@Injectable({
  providedIn: 'root'
})
export class RecentSearchesService implements OnDestroy {
  private readonly navigationService = inject(NavigationService);

  private readonly subscription = new Subscription();

  constructor() {
    this.navigationService.navigationEnd$
      .pipe(
        filter((event: RouterEvent) => isASearchRoute(event.url))
      )
      .subscribe(() => {
        fetchUserSettings().then(result => this.saveSearch(result));
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public saveSearch(result: UserSettings): void {
    if (!searchInputStore.state) {
      console.log('Avoid saving empty search');
      return;
    }

    let recentSearches = result.recentSearches;

    if (recentSearches === undefined)
      recentSearches = [];
    else if (recentSearches.length >= RECENT_SEARCHES_MAX_STORAGE)
      recentSearches.pop();

    // Save only the hash part of the URL with the #
    recentSearches.unshift({ url: window.location.hash.substring(1), date: new Date().toISOString() });

    patchUserSettings({ recentSearches });
  }
}