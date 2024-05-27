import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { SavedSearchesService } from '@/app/services/saved-searches.service';
import { SavedSearch as UserSettingsSavedSearch } from '@/app/types/user-settings';
import { QueryParams, getQueryParamsFromUrl } from '@/app/utils/query-params';
import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { StopPropagationDirective } from 'toolkit';

const SAVED_SEARCHES_ITEMS_PER_PAGE = 5;

type SavedSearch = UserSettingsSavedSearch & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
}

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [NgClass, StopPropagationDirective, RelativeDatePipe],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  }
})
export class SavedSearchesComponent {
  public range = signal<number>(SAVED_SEARCHES_ITEMS_PER_PAGE);
  protected readonly savedSearches = signal<SavedSearch[]>([]);
  public paginatedSearches = computed<SavedSearch[]>(() => this.savedSearches().slice(0, this.range()));
  public hasMore = computed<boolean>(() => this.savedSearches().length > 0 && this.range() < this.savedSearches().length);

  private readonly router = inject(Router);
  private readonly savedSearchesService = inject(SavedSearchesService);

  constructor() {
    effect(() => {
      const savedSearches = this.savedSearchesService.getSavedSearches();
      this.savedSearches.set(
        (savedSearches || []).reduce((acc, savedSearch) => {
          const queryParams = getQueryParamsFromUrl(savedSearch.url);

          acc.push(
            Object.assign(savedSearch, {
              label: queryParams?.text || '',
              filterCount: queryParams?.filters?.length || 0,
              queryParams
            })
          );

          return acc;
        }, [] as SavedSearch[])
      );
    }, { allowSignalWrites: true });
  }

  public onClick(savedSearch: SavedSearch) {
    const queryParams = {
      q: savedSearch.queryParams?.text
    } as { q: string, f?: string };

    if (savedSearch.queryParams?.filters && savedSearch.queryParams?.filters?.length > 0)
      queryParams.f = JSON.stringify(savedSearch.queryParams?.filters);

    this.router.navigate([savedSearch.queryParams?.path], { queryParams });
  }

  public onDelete(index: number, e: Event) {
    e.stopPropagation();
    const searches = this.savedSearches();

    if (searches) {
      searches?.splice(index, 1);

      this.savedSearches.set(searches);
      this.savedSearchesService.updateSavedSearches(searches);
      toast.success('Saved search deleted');
    }
  }

  loadMore(e: Event) {
    e.stopPropagation();
    this.range.set(this.range() + SAVED_SEARCHES_ITEMS_PER_PAGE);
  }
}
