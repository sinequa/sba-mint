import { NgClass } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { RelativeDate as AtomicRelativeDate, QueryParams, SavedSearch as S, SavedSearchesService, getQueryParamsFromUrl } from '@sinequa/atomic-angular';

import { getRelativeDate } from '@sinequa/atomic';
import { StopPropagationDirective } from 'toolkit';

const SAVED_SEARCHES_ITEMS_PER_PAGE = 5;

type SavedSearch = S & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
}

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

export type RelativeDate = AtomicRelativeDate & {
  unit: Intl.RelativeTimeFormatUnit;
}

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [NgClass, StopPropagationDirective, TranslocoPipe],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'block overflow-auto max-h-[460px]'
  },
  providers: [provideTranslocoScope({ scope: 'saved-searches', loader })]
})
export class SavedSearchesComponent {
  protected readonly range = signal<number>(SAVED_SEARCHES_ITEMS_PER_PAGE);
  protected readonly savedSearches = signal<SavedSearch[]>([]);
  protected readonly paginatedSearches = computed<SavedSearch[]>(() => this.savedSearches().slice(0, this.range()));
  protected readonly hasMore = computed<boolean>(() => this.savedSearches().length > 0 && this.range() < this.savedSearches().length);

  protected readonly getRelativeDate = getRelativeDate;

  private readonly router = inject(Router);
  private readonly savedSearchesService = inject(SavedSearchesService);
  protected readonly transloco = inject(TranslocoService);

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

  public onClick(savedSearch: SavedSearch): void {
    const queryParams = {
      q: savedSearch.queryParams?.text
    } as { q: string, f?: string };

    if (savedSearch.queryParams?.filters && savedSearch.queryParams?.filters?.length > 0)
      queryParams.f = JSON.stringify(savedSearch.queryParams?.filters);

    this.router.navigate([savedSearch.queryParams?.path], { queryParams });
  }

  public async onDelete(index: number, e: Event) {
    e.stopPropagation();
    await this.savedSearchesService.deleteSavedSearch(index);
    toast.success('Saved search deleted');
  }

  public loadMore(e: Event): void {
    e.stopPropagation();
    this.range.set(this.range() + SAVED_SEARCHES_ITEMS_PER_PAGE);
  }
}
