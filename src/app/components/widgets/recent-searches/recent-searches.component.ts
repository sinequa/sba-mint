import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { QueryParamsStore, UserSettingsStore } from '@/app/stores';
import { RecentSearch } from '@/app/types';
import { QueryParams, getQueryParamsFromUrl } from '@/app/utils';

const RECENT_SEARCHES_ITEMS_PER_PAGE = 5;

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [FocusWithArrowKeysDirective, RelativeDatePipe],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  }
})
export class RecentSearchesComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly router = inject(Router);

  public range = signal<number>(RECENT_SEARCHES_ITEMS_PER_PAGE);
  public recentSearches = signal<RecentSearch[]>([]);
  public paginatedRecentSearches = computed<RecentSearch[]>(() => this.recentSearches().slice(0, this.range()));
  public hasMore = computed<boolean>(() => this.recentSearches().length > 0 && this.range() < this.recentSearches().length);

  constructor() {
    effect(() => {
      const searches = this.userSettingsStore.recentSearches();
      this.recentSearches.set(searches);
    }, { allowSignalWrites: true });
   }

  /**
   * Handles the click event for a recent search item.
   * Navigates to the specified path with the query parameters from the recent search.
   * @param recentSearch - The recent search item that was clicked.
   */
  onClick(recentSearch: RecentSearch): void {
    const { text, filters = [], tab, page } = recentSearch.queryParams || {} as QueryParams;

    const queryParams = {
      q: text,
      f: filters.length > 0 ? JSON.stringify(filters) : undefined,
      t: tab,
      p: page
    };
    this.queryParamsStore.setFromUrl(recentSearch.url);
    this.router.navigate([recentSearch.url], { queryParams });
  }

  /**
   * Deletes a recent search item at the specified index.
   * @param index - The index of the item to delete.
   * @param e - The event object.
   */
  onDelete(index: number, e: Event) {
    e.stopPropagation();
    const searches = this.recentSearches();

    if (searches) {
      searches?.splice(index, 1);
      this.userSettingsStore.updateRecentSearches(searches);
      toast.success('Recent search deleted');
    }
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + RECENT_SEARCHES_ITEMS_PER_PAGE);
  }
}