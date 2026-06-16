import { afterNextRender, Component, effect, inject, signal, untracked } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';

import { getRelativeDate } from '@sinequa/atomic';
import { ApplicationService, SearchItem, TranslocoDateImpurePipe, UserSettingsStore } from '@sinequa/atomic-angular';
import { ButtonComponent, HistoryIcon, ListItemComponent, TrashCanIcon } from '@sinequa/ui';

@Component({
  selector: 'app-recent-searches',
  imports: [RouterModule, TranslocoPipe, ButtonComponent, ListItemComponent, HistoryIcon, TrashCanIcon],
  template: `
    <div class="layout-search overflow-auto">
      <div class="col-span-2 col-start-2 overflow-hidden">
        <h1 class="mt-6 mb-4 flex items-center gap-2 text-2xl font-semibold">
          <HistoryIcon />
          {{ 'history' | transloco }}
        </h1>

        <ul class="flex h-[calc(100%-72px)] flex-col overflow-auto">
          @for (scope of history(); track $index) {
            <li role="presentation" class="bg-background sticky top-0 my-3 text-lg font-semibold capitalize">
              {{ getDate(scope.date) }}
            </li>

            @for (search of scope.searches; track $index) {
              <li
                class="group grid grid-cols-[auto_20%_min-content] items-center rounded-md p-1"
                role="listitem"
                attr.data-href="{{ search.path || search.queryParams?.path }}"
                [routerLink]="[search.path || search.queryParams?.path]"
                [queryParams]="getQueryParams(search)">
                <span class="ms-2">
                  {{ search.display || search.label }}
                </span>

                <span class="text-muted-foreground">
                  {{ 'in' | transloco }}

                  <span class="font-semibold capitalize">
                    {{ search.queryParams?.tab ?? 'all' }}
                  </span>

                  @if (search.filterCount) {
                    ,
                    <span class="font-semibold lowercase"> {{ search.filterCount }} {{ 'filters' | transloco }} </span>
                  }
                </span>

                <button variant="icon" size="icon" class="text-destructive invisible group-hover:visible hover:scale-125" (click)="remove($event, search)">
                  <TrashCanIcon />
                </button>
              </li>
            }
          } @empty {
            <li class="no-records">
              {{ 'searches.recent.noRecentSearches' | transloco }}
            </li>
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
  readonly applicationService = inject(ApplicationService);

  constructor() {
    afterNextRender(this.setTitle.bind(this));

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

    this.transloco.langChanges$.subscribe(this.setTitle.bind(this));
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

  /**
   * Sets the page title to the translated "mySavedSearches" text.
   * Uses the transloco service to get the localized title and updates
   * the application title through the applicationService.
   * @private
   */
  private setTitle() {
    const title = this.transloco.translate('history');
    this.applicationService.setTitle(title);
  }
}
