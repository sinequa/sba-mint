import { afterNextRender, Component, computed, effect, ElementRef, inject, InjectionToken, signal, viewChild, viewChildren } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HashMap, provideTranslocoScope, Translation } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";

import { AggregationsStore, AppStore, CFilter, cn, QueryParamsStore } from "@sinequa/atomic-angular";

import { FilterButtonComponent } from "./buttons/filter-button.component";
import { FilterDateButtonComponent } from "./buttons/filter-date-button.component";
import { FiltersMoreButtonComponent } from "./buttons/filters-more-button.component";
import { CFilterEx, FILTERS_BREAKPOINT } from "./filters.models";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: "filters-list, FiltersList",
  standalone: true,
  imports: [FiltersMoreButtonComponent, FilterButtonComponent, FilterDateButtonComponent],
  providers: [provideTranslocoScope({ scope: 'filters', loader })],
  template: `
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

  @if(hasAggregations()) {
    <FilterDateButton/>

    @for(filter of filters(); track $index) {
      <FilterButton [class]="cn(
        filter.hidden && 'hidden',
        hasMoreFilters() && $index >= moreFilterCount() && 'invisible'
        )" [filter]="filter" />
    }

    @if(hasMoreFilters()) {
      <FiltersMoreButton class="absolute right-0" [count]="moreFilterCount()" />
    }
  }
  `,
  host: {
    "role": "list",
    "aria-label": "Filters list",
  },
})
export class FiltersListComponent {
  cn = cn;

  moreFilterElement = viewChild<FiltersMoreButtonComponent>(FiltersMoreButtonComponent);
  dropdownElements = viewChildren<FilterButtonComponent>(FilterButtonComponent);

  filtersCount = inject(FILTERS_BREAKPOINT);

  route = inject(ActivatedRoute)
  appStore = inject(AppStore);
  aggregationsStore = inject(AggregationsStore);
  queryParamsStore = inject(QueryParamsStore);

  filters = signal<CFilterEx[]>([]);
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

  resizeObserver = new ResizeObserver(() => this.adjustFiltersCount());

  constructor(private el: ElementRef) {
    afterNextRender(() => {
      this.resizeObserver.observe(this.el.nativeElement);
    });

    this.adjustFiltersCount();

    effect(() => {
      // set filters according to the route and the authorized filters with default values

      const authorizedFilters = this.appStore.getAuthorizedFilters(this.route)
        .filter(f => f.name !== "Modified")
        .map(f => f.column)
        .toSpliced(this.filtersCount);

      const f = authorizedFilters.map((filter) => {
        const { icon, hidden = false } = this.appStore.getAggregationCustomization(filter) as CFilter || {};
        return ({
          name: filter,
          column: filter,
          icon,
          count: 0,
          isTree: false,
          disabled: false,
          hidden,
        }) as CFilterEx
      });

      this.filters.set(f);
      this.updateFilter();
      this.adjustFiltersCount();
    }, { allowSignalWrites: true });

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
  adjustFiltersCount(): void {
    if (this.filters().length) {
      const moreFiltersRect = this.moreFilterElement()?.nativeElement.getBoundingClientRect();
      const dropdownsRects = this.dropdownElements().map(el => el.nativeElement.getBoundingClientRect());

      let index = 0;
      dropdownsRects.forEach(r => {
        if ((r.right + 2) <= moreFiltersRect?.left!) index++;
      });
      this.moreFilterCount.set(index > this.filtersCount ? this.filtersCount : index);
    }
    else {
      this.moreFilterCount.set(this.filtersCount);
    }
  }

  /**
   * Updates the filters list by mapping through each filter and updating its properties
   * based on the corresponding aggregation and query parameters.
   *
   * - Retrieves the aggregation for each filter's column.
   * - Gets the filter from the query parameters store using the aggregation name.
   * - Determines the count of items for the filter.
   * - Retrieves the display customization for the filter's column.
   * - Updates the filter properties including name, display, isTree, count, and disabled status.
   *
   */
  updateFilter() {
    this.filters.update(filters => {
      return filters.map((filter) => {
        const agg = this.aggregationsStore.getAggregation(filter.column, "column");
        const f = this.queryParamsStore.getFilter(agg?.name);
        const count = f?.count || 0;

        const { display = agg?.isTree ? undefined : f?.display || filter.display } = this.appStore.getAggregationCustomization(filter.column) as CFilter || {};

        return {
          ...filter,
          name: agg?.name || filter.name,
          display,
          isTree: agg?.isTree || false,
          count,
          disabled: !agg?.items || agg.items?.length === 0 ? true : false,
        };
      })
    })
  }

}