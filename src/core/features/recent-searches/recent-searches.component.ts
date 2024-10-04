import { Component, computed, inject, signal } from '@angular/core';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { getRelativeDate } from '@sinequa/atomic';
import { RecentSearch, UserSettingsStore } from '@sinequa/atomic-angular';
import { RecentSearchComponent } from "./recent-search.component";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

const RECENT_SEARCHES_ITEMS_PER_PAGE = 5;

@Component({
  selector: 'app-recent-searches, RecentSearches',
  standalone: true,
  imports: [TranslocoPipe, RecentSearchComponent],
  templateUrl: './recent-searches.component.html',
  host: {
    class: 'block max-h-[460px]'
  },
  providers: [provideTranslocoScope({ scope: 'recent-searches', loader })]
})
export class RecentSearchesComponent {
  private readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly transloco = inject(TranslocoService);

  protected readonly range = signal<number>(RECENT_SEARCHES_ITEMS_PER_PAGE);
  protected readonly recentSearches = computed<RecentSearch[]>(() => this.userSettingsStore.recentSearches());
  protected readonly paginatedRecentSearches = computed<RecentSearch[]>(() => this.recentSearches().slice(0, this.range()));
  protected readonly hasMore = computed<boolean>(() => this.recentSearches().length > 0 && this.range() < this.recentSearches().length);

  protected readonly getRelativeDate = getRelativeDate;

  /**
   * Deletes a recent search item at the specified index.
   * @param index - The index of the item to delete.
   * @param e - The event object.
   */
  async remove(index: number, e: Event) {
    e.stopPropagation();
    await this.userSettingsStore.deleteRecentSearch(index);
    toast.success('Recent search deleted');
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + RECENT_SEARCHES_ITEMS_PER_PAGE);
  }
}