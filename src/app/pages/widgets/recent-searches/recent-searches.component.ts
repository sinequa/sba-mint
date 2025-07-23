import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { getRelativeDate } from '@sinequa/atomic';
import { SearchItem, TranslocoDateImpurePipe, UserSettingsStore } from '@sinequa/atomic-angular';

@Component({
  selector: 'app-recent-searches',
  imports: [RouterModule, TranslocoPipe],
  template: `
    <div class="layout-search overflow-auto">
      <div class="col-span-2 col-start-2">
        <h1 class="mt-6 mb-4 flex items-center gap-2 text-2xl font-semibold">
          <i class="fa-fw far fa-clock-rotate-left" aria-hidden></i>
          {{ 'history' | transloco }}
        </h1>

        <ul class="flex flex-col">
          @for (scope of history(); track $index) {
            <li role="presentation" class="my-3 text-lg font-semibold capitalize">
              {{ getDate(scope.date) }}
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

                <button class="invisible text-red-500 group-hover:visible hover:scale-125 hover:cursor-pointer" (click)="remove($event, search)">
                  <i class="fa-fw far fa-trash-can" aria-hidden></i>
                </button>
              </li>
            }
          }
        </ul>
      </div>
    </div>
  `,
  host: {
    class: 'flex flex-col h-full w-full'
  },
  providers: [TranslocoDateImpurePipe]
})
export class RecentSearchesComponent {
  readonly getRelativeDate = getRelativeDate;

  readonly router = inject(Router);
  readonly userSettingsStore = inject(UserSettingsStore);
  readonly history = signal<{ date: string; searches: SearchItem[] }[]>([]);
  readonly transloco = inject(TranslocoService);
  readonly datePipe = inject(TranslocoDateImpurePipe);

  constructor() {
    effect(() => {
      const recentSearches = this.userSettingsStore.recentSearches();

      untracked(() => {
        const groupedByDay = recentSearches.reduce(
          (acc, search) => {
            const date = new Date(search.date).toISOString().split('T')[0];

            if (!acc[date]) acc[date] = [];

            acc[date].push(search);

            return acc;
          },
          {} as Record<string, SearchItem[]>
        );
        const sortedDates = Object.keys(groupedByDay).sort((a, b) => b.localeCompare(a));
        const sortedGroupedByDay = sortedDates.map(date => ({ date, searches: groupedByDay[date] }));

        this.history.set(sortedGroupedByDay);
      });
    });
  }

  async remove(event: Event, search: SearchItem) {
    event.stopImmediatePropagation();

    const index = this.userSettingsStore.recentSearches().findIndex(s => s === search);
    await this.userSettingsStore.deleteRecentSearch(index);

    toast.success('Recent search deleted');
  }

  getQueryParams(search: SearchItem): Record<string, string> {
    return {
      q: search.queryParams?.text,
      f: (search.queryParams?.filters ?? []).length > 0 ? JSON.stringify(search.queryParams?.filters) : undefined,
      t: search.queryParams?.tab,
      p: search.queryParams?.page,
      n: search.queryParams?.name
    } as any;
  }

  getDate(date: string): string {
    const d = getRelativeDate('en', date);
    const formattedDate = this.datePipe.transform(date, 'fullDate');

    // if today, add "Today - " in front of the formatted date
    if (d.toLocaleLowerCase() === 'today') {
      const langDate = getRelativeDate(this.transloco.getActiveLang(), date);
      return `${langDate} - ${formattedDate}`;
    }

    return formattedDate || date;
  }
}
