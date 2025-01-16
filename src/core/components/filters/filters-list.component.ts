import { Component, computed, effect, ElementRef, inject, OnDestroy, signal, viewChild, viewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HashMap, provideTranslocoScope, Translation, TranslocoService } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { AggregationsStore, AppStore, cn, OverflowItemDirective, OverflowManagerDirective, OverflowStopDirective, QueryParamsStore } from "@sinequa/atomic-angular";

import { debounceTime, Subscription } from "rxjs";
import { FilterButtonComponent } from "./buttons/filter-button.component";
import { FilterDateButtonComponent } from "./buttons/filter-date-button.component";
import { FiltersMoreButtonComponent } from "./buttons/filters-more-button.component";
import { FILTERS_BREAKPOINT } from "./filters.models";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: "filters-list, FiltersList",
  standalone: true,
  imports: [
    FiltersMoreButtonComponent,
    FilterButtonComponent,
    FilterDateButtonComponent,
    OverflowManagerDirective,
    OverflowItemDirective,
    OverflowStopDirective
  ],
  providers: [provideTranslocoScope({ scope: 'filters', loader })],
  template: `
    <ng-container overflowManager [target]="el.nativeElement" (count)="adjustFiltersCount($event)">
      @if (hasFilters()) {
        <button
          class="btn bg-alert/10 text-alert"
          aria-label="clear all filters"
          (click)="clearFilters()"
          (keydown.enter)="clearFilters()"
        >
          <i class="fa-fw far fa-trash-can " aria-hidden="true"></i>
        </button>
      }

      @if (hasAggregations()) {
        <FilterDateButton />

        @for (filter of filters(); track $index) {
          <FilterButton
            overflowItem
            [column]="filter"
          />
        }

        @if (hasMoreFilters()) {
          <FiltersMoreButton
            overflowStop
            class="absolute right-0"
            [count]="moreFilterCount()"
          />
        }
        @else {
          <div overflowStop class="absolute right-0"></div>
        }
      }
    </ng-container>
  `,
  host: {
    "role": "list",
    "aria-label": "Filters list",
  }
})
export class FiltersListComponent implements OnDestroy {
  cn = cn;

  moreFilterElement = viewChild<FiltersMoreButtonComponent>(FiltersMoreButtonComponent);
  dropdownElements = viewChildren<FilterButtonComponent>(FilterButtonComponent);
  readonly overflowManager = viewChild<OverflowManagerDirective>(OverflowManagerDirective);

  filtersCount = inject(FILTERS_BREAKPOINT);

  route = inject(ActivatedRoute)
  appStore = inject(AppStore);
  aggregationsStore = inject(AggregationsStore);
  queryParamsStore = inject(QueryParamsStore);
  el = inject(ElementRef);
  readonly transloco = inject(TranslocoService);

  filters = signal<string[]>([]);
  moreFilterCount = signal(this.filtersCount);

  hasFilters = computed(() => {
    // when the query parameters store updates, update the hasFilters signal
    // to show or hide the clear filters button
    const state = getState(this.queryParamsStore);
    return Array.isArray(state.filters) && state.filters.length > 0;
  });

  hasAggregations = computed(() => {
    if (this.aggregationsStore.aggregations()) return this.aggregationsStore.aggregations().length > 0;
    return false;
  });

  hasMoreFilters = computed(() => {
    // more filters button is hidden by default
    // to show the filters button, aggregations MUST contains items
    const moreFiltersAggregations = this.appStore.getAuthorizedFilters(this.route)
      .filter(f => f.name !== "Modified")
      .map(f => f.column)
      .toSpliced(0, this.filtersCount)
      .map(column => this.aggregationsStore.getAggregation(column, "column"));

    return moreFiltersAggregations.some(agg => agg?.items && agg.items.length > 0);
  })

  filterDate = { name: "#date", column: "modified", count: 0, isTree: false, disabled: false, hidden: false };

  private readonly sub = new Subscription();

  constructor() {
    effect(() => {
      // set filters according to the route and the authorized filters with default values
      const authorizedFilters = this.appStore.getAuthorizedFilters(this.route)
        .filter(f => f.name !== "Modified")
        .map(f => f.column)
        .toSpliced(this.filtersCount);

      this.filters.set(authorizedFilters);
    }, { allowSignalWrites: true });

    this.sub.add(
      this.transloco.events$.pipe(debounceTime(100)).subscribe(() => this.overflowManager()?.countItems())
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /**
   * Clears all filters by invoking the clearFilters method on the queryParamsStore.
   * This method is typically used to reset the filter state to its default values.
   */
  clearFilters(): void {
    this.queryParamsStore.clearFilters();
  }

  /**
   * Adjusts the count of filters that can be displayed before the "more filters" option is shown.
   *
   * This method calculates the number of filter dropdowns that can fit in the available space
   * before the "more filters" button. It updates the `moreFilterCount` property with the number
   * of filters that can be displayed. If no filters are present, it sets the `moreFilterCount`
   * to the total number of filters.
   *
   */
  adjustFiltersCount(count: number): void {
    this.moreFilterCount.set(count > this.filtersCount ? this.filtersCount : count);
  }
}