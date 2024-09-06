import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { getRelativeDate } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective, QueryParams, QueryParamsStore, RecentSearch, RelativeDatePipe, UserSettingsStore } from '@sinequa/atomic-angular';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

const RECENT_SEARCHES_ITEMS_PER_PAGE = 5;

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [FocusWithArrowKeysDirective, RelativeDatePipe, TranslocoPipe],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  },
  providers: [provideTranslocoScope({ scope: 'recent-searches', loader })]
})
export class RecentSearchesComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly router = inject(Router);
  protected readonly transloco = inject(TranslocoService);

  protected readonly range = signal<number>(RECENT_SEARCHES_ITEMS_PER_PAGE);
  protected readonly recentSearches = computed<RecentSearch[]>(() => this.userSettingsStore.recentSearches());
  protected readonly paginatedRecentSearches = computed<RecentSearch[]>(() => this.recentSearches().slice(0, this.range()));
  protected readonly hasMore = computed<boolean>(() => this.recentSearches().length > 0 && this.range() < this.recentSearches().length);

  protected readonly getRelativeDate = getRelativeDate;

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
  async onDelete(index: number, e: Event) {
    e.stopPropagation();
    await this.userSettingsStore.deleteRecentSearch(index);
    toast.success('Recent search deleted');
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + RECENT_SEARCHES_ITEMS_PER_PAGE);
  }
}