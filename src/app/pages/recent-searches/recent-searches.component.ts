import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { getRelativeDate } from '@sinequa/atomic';
import { RecentSearch, UserSettingsStore } from '@sinequa/atomic-angular';

import { countFilters, wrapFiltersToArray } from '@/core/features/recent-searches/utils';

import { NavbarComponent } from '../../../core/components/navbar/navbar.component';

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [RouterModule, NavbarComponent, TranslocoPipe],
  template: `
    <app-navbar class="pt-4" />

    <div class="layout-search overflow-auto">
      <div class="col-span-2 col-start-2">
        <h1 class="mb-4 mt-6 flex gap-2 text-2xl font-semibold">
          <i class="fa-fw far fa-clock-rotate-left" aria-hidden></i>
          {{ 'history' | transloco }}
        </h1>

        <ul class="flex flex-col">
          @for (scope of history(); track $index) {
            <li role="presentation" class="my-3 text-xl font-semibold capitalize">
              {{ getRelativeDate('fr', scope.date) }}
            </li>

            @for (search of scope.searches; track $index) {
              <li
                class="group grid grid-cols-[auto_20%_min-content] rounded-md p-1 hover:cursor-pointer hover:bg-blue-50"
                role="link"
                attr.data-href="{{ search.path || search.queryParams?.path }}"
                [routerLink]="[search.path || search.queryParams?.path]"
                [queryParams]="getQueryParams(search)">
                <span class="ms-2">
                  {{ search.display || search.label }}
                </span>

                <span class="text-gray-500">
                  {{ 'in' | transloco }}

                  <span class="font-semibold capitalize">
                    {{ search.queryParams?.tab ?? 'all' }}
                  </span>

                  @if (search.filterCount) {
                    ,
                    <span class="font-semibold lowercase"> {{ search.filterCount }} {{ 'filters' | transloco }} </span>
                  }
                </span>

                <button class="invisible text-red-500 group-hover:visible" (click)="remove($event, search)">
                  <i class="fa-fw far fa-trash" aria-hidden></i>
                </button>
              </li>
            }
          }
        </ul>
      </div>
    </div>
  `,
  styles: ``
})
export class RecentSearchesComponent {
  readonly getRelativeDate = getRelativeDate;

  readonly router = inject(Router);
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly history = signal<{ date: string; searches: RecentSearch[] }[]>([]);

  constructor() {
    effect(
      () => {
        const recentSearches = this.userSettingsStore.recentSearches();

        untracked(() => {
          const groupedByDay = recentSearches.reduce(
            (acc, search) => {
              const date = new Date(search.date).toISOString().split('T')[0];

              if (!acc[date]) acc[date] = [];

              acc[date].push(search);

              // add filterCount on the fly
              search.filterCount = countFilters(search.queryParams?.filters);

              if (search.queryParams?.filters) search.queryParams.filters = wrapFiltersToArray(search.queryParams.filters);

              return acc;
            },
            {} as Record<string, RecentSearch[]>
          );
          const sortedDates = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
          const sortedGroupedByDay = sortedDates.map(date => ({ date, searches: groupedByDay[date] }));

          this.history.set(sortedGroupedByDay);
        });
      },
      { allowSignalWrites: true }
    );
  }

  async remove(event: Event, search: RecentSearch) {
    event.stopImmediatePropagation();

    const index = this.userSettingsStore.recentSearches().findIndex(s => s === search);
    await this.userSettingsStore.deleteRecentSearch(index);

    toast.success('Recent search deleted');
  }

  getQueryParams(search: RecentSearch): Record<string, string> {
    return {
      q: search.queryParams?.text,
      f: (search.queryParams?.filters ?? []).length > 0 ? JSON.stringify(search.queryParams?.filters) : undefined,
      t: search.queryParams?.tab,
      p: search.queryParams?.page,
      queryName: search.queryParams?.queryName
    } as any;
  }
}
