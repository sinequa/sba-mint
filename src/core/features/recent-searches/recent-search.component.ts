import { Component, computed, inject, input, output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { TranslocoPipe, TranslocoService } from "@jsverse/transloco";
import { getRelativeDate, QueryParams } from "@sinequa/atomic";
import { RecentSearch } from "@sinequa/atomic-angular";

@Component({
  selector: 'RecentSearch',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  template: `
      <li
      class="group flex h-10 gap-2 px-3 py-2 items-center rounded cursor-pointer hover:bg-secondary hover:text-primary focus:bg-secondary focus:text-primary focus:outline-none"
      tabindex="0"
      attr.data-href="{{ recentSearch().path || recentSearch().queryParams?.path }}"
      [routerLink]="[recentSearch().path || recentSearch().queryParams?.path]" [queryParams]="queryParams()"
      (keydown.enter)="onKeyDown()"
    >
      <i class="fa-fw far fa-clock-rotate-left " aria-hidden="true"></i>

      <p class="truncate">{{ recentSearch().display || recentSearch().label }}</p>

      @if ((recentSearch().filterCount ?? 0) > 0) {
        <p class="text-neutral-500" aria-hidden="true">
          <i class="fa-fw far fa-filter"></i>

          {{ "recentSearches.filterCount" | transloco : { count: recentSearch().filterCount } }}
        </p>
      }

      @if (recentSearch().date) {
        <p class="text-neutral-500 ms-auto first-letter:capitalize">
          {{ getRelativeDate(transloco.getActiveLang(), recentSearch().date) }}
        </p>
      }

      <button
        class="hidden group-hover:block text-alert hover:scale-125"
        [attr.title]="'recentSearches.removeRecentSearch' | transloco"
        [attr.aria-label]="'recentSearches.removeRecentSearch' | transloco"
        (click)="remove.emit($event)"
      >
        <i class="fa-fw fa-regular fa-trash-can " aria-hidden="true"></i>
      </button>
    </li>
`
})
export class RecentSearchComponent {
  protected readonly getRelativeDate = getRelativeDate;

  remove = output<Event>();

  recentSearch = input.required<RecentSearch>();
  queryParams = computed(() => {
    const { text, filters = [], tab, page, queryName } = this.recentSearch().queryParams || {} as QueryParams;

    const queryParams = {
      q: text,
      f: filters.length > 0 ? JSON.stringify(filters) : undefined,
      t: tab,
      p: page,
      queryName
    };
    return queryParams;
  });

  protected readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);


  onKeyDown() {
    // this.queryParamsStore.setFromUrl(queryParams);
    this.router.navigate([this.recentSearch().path], { queryParams: this.queryParams() });
  }
}