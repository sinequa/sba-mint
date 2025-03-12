import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { getRelativeDate, QueryParams } from '@sinequa/atomic';
import { RecentSearch } from '@sinequa/atomic-angular';

import { countFilters, wrapFiltersToArray } from './utils';
import { ListItemComponent } from '@sinequa/ui';

@Component({
  selector: 'RecentSearch',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, ListItemComponent],
  template: `
    <span
      role="listitem"
      tabindex="0"
      class="group h-10 *:whitespace-nowrap"
      [routerLink]="[recentSearch().path || recentSearch().queryParams?.path]"
      [queryParams]="queryParams()"
      (keydown.enter)="onKeyDown()"
      [attr.aria-label]="display()">
      <i class="fa-fw far fa-clock-rotate-left" aria-hidden="true"></i>

      <p class="truncate">{{ display() }}</p>

      @if (filterCount() > 0) {
        <p class="text-neutral-500" aria-hidden="true">
          <i class="fa-fw far fa-filter"></i>

          {{ 'recentSearches.filterCount' | transloco: { count: filterCount() } }}
        </p>
      }

      @if (recentSearch().date) {
        <p class="ms-auto text-neutral-500 first-letter:capitalize">
          {{ getRelativeDate(transloco.getActiveLang(), recentSearch().date) }}
        </p>
      }

      <button
        class="invisible text-destructive hover:scale-125 group-hover:visible group-hover:block"
        [attr.title]="'recentSearches.removeRecentSearch' | transloco"
        [attr.aria-label]="'recentSearches.removeRecentSearch' | transloco"
        (click)="remove.emit($event)">
        <i class="fa-fw fa-regular fa-trash-can" aria-hidden="true"></i>
      </button>
    </span>
  `
})
export class RecentSearchComponent {
  protected readonly getRelativeDate = getRelativeDate;

  remove = output<Event>();

  recentSearch = input.required<RecentSearch>();
  display = computed(() => this.recentSearch().display || this.recentSearch().label);

  queryParams = computed(() => {
    const { text, filters = [], tab, page, queryName } = this.recentSearch().queryParams || ({} as QueryParams);
    const wrapped = wrapFiltersToArray(filters) ?? [];

    const queryParams = {
      q: text,
      f: wrapped.length > 0 ? JSON.stringify(wrapped) : undefined,
      t: tab,
      p: page,
      queryName
    };
    return queryParams;
  });
  filterCount = computed(() => countFilters(this.recentSearch().queryParams?.filters) ?? 0);

  protected readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);

  onKeyDown() {
    // this.queryParamsStore.setFromUrl(queryParams);
    this.router.navigate([this.recentSearch().path], { queryParams: this.queryParams() });
  }
}
