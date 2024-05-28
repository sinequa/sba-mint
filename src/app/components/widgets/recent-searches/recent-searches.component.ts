import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { RecentSearchesService } from '@/app/services';
import { RecentSearch } from '@/app/types';
import { QueryParams } from '@/app/utils';

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

  private readonly router = inject(Router);
  private readonly recentSearchesService = inject(RecentSearchesService);

  public range = signal<number>(RECENT_SEARCHES_ITEMS_PER_PAGE);
  public recentSearches = computed<RecentSearch[]>(() => (this.recentSearchesService.getRecentSearches() || []).slice(0, this.range()));
  public totalSearches = computed<number>(() => (this.recentSearchesService.getRecentSearches() || []).length);
  public hasMore = computed<boolean>(() => this.totalSearches() > 0 && this.range() < this.totalSearches());

  constructor() { }

  onClick(recentSearch: RecentSearch): void {
    const { text, filters = [] } = recentSearch.queryParams || {} as QueryParams;

    const queryParams = {
      q: text,
      f: filters.length > 0 ? JSON.stringify(filters) : undefined
    };

    this.router.navigate([recentSearch.queryParams?.path], { queryParams });
  }

  onDelete(index: number, e: Event) {
    e.stopPropagation();
    const searches = this.recentSearches();

    if (searches) {
      searches?.splice(index, 1);
      this.recentSearchesService.saveSearch(searches)
      toast.success('Recent search deleted');
    }
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + RECENT_SEARCHES_ITEMS_PER_PAGE);
  }
}