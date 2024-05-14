import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, OnInit, ViewChildren, computed, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, Filter as ApiFilter } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective, cn } from '@sinequa/atomic-angular';

import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, SearchService } from '@/app/services';
import { AppStore, QueryParamsStore } from '@/app/stores';
import { Filter, buildQuery } from '@/app/utils';
import { AggregationsStore } from '@/stores';

import { AggregationComponent } from './components/aggregation/aggregation.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { MoreFiltersComponent } from './components/more-filters/more-filters.component';
import { getAuthorizedFilters } from './filter';
import { FilterDropdown } from './models/filter-dropdown';
import { DropdownComponent } from "../dropdown/dropdown";

export const FILTERS_COUNT = 4;

@Component({
  selector: 'app-filters',
  standalone: true,
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  imports: [NgClass, AsyncPipe, DateFilterComponent, AggregationComponent, MoreFiltersComponent, FocusWithArrowKeysDirective, DropdownComponent]
})
export class FiltersComponent implements OnInit {
  @ViewChildren(AggregationComponent) aggregations!: AggregationComponent[];

  cn = cn;

  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _aggregationsService = inject(AggregationsService);
  private readonly _aggregationsStore = inject(AggregationsStore);
  private readonly _searchService = inject(SearchService);
  private readonly appStore = inject(AppStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  readonly filters = this.queryParamsStore.filters || signal([]);
  readonly hasMoreFilters = signal<boolean>(false);
  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly dateFilterDropdown = signal<FilterDropdown | undefined>(undefined);

  readonly moreFiltersCount = computed(() => {
    const { filters = [] } = getState(this.queryParamsStore);

    // count more filters
    return filters
      .filter(f => this.moreFiltersColumns.includes(f.column))
      .reduce((acc, f) => acc + f.values.length, 0);
  });


  private readonly _subscriptions = new Subscription();

  moreFiltersColumns: string[] = [];

  constructor() {

    effect(() => {
      const { aggregations } = getState(this._aggregationsStore);
      const authorizedFilters = getAuthorizedFilters(this._injector);

      if (!authorizedFilters) return;

      if (authorizedFilters.length > FILTERS_COUNT)
        this.hasMoreFilters.set(true);

      if (authorizedFilters.includes("#date")) {
        const agg = aggregations?.find(agg => agg.name === "Modified") as AggregationListEx;
        if (agg) {
          const filter = this.queryParamsStore.getFilterFromColumn(agg.column);
          const value = this.getFilterValue(filter);

          this.dateFilterDropdown.set({
            label: 'Date',
            aggregation: agg,
            currentFilter: filter,
            value,
            icon: 'far fa-calendar-day'
          });
        }
      }

      const agg = this.buildFilterDropdownsFromAggregations(aggregations
        .filter(a => authorizedFilters.includes(a.column))
        .sort((a, b) => authorizedFilters.indexOf(a.column) - authorizedFilters.indexOf(b.column))
        .splice(0, FILTERS_COUNT));


      this.moreFiltersColumns = aggregations
        .filter(a => authorizedFilters.includes(a.column))
        .sort((a, b) => authorizedFilters.indexOf(a.column) - authorizedFilters.indexOf(b.column))
        .splice(FILTERS_COUNT).map(a => a.column);

      this.filterDropdowns.set(agg);
    }, { allowSignalWrites: true })
  }

  ngOnInit(): void {
    this._subscriptions.add(
      this._activatedRoute.queryParams.subscribe((queryParams) => {
        let filters;
        if (queryParams['f']) {
          filters = JSON.parse(queryParams['f']);
        }
        this.queryParamsStore.patch({ filters });
      })
    );
  }

  public filterUpdated(filter: Filter, index: number): void {
    this.updateDropdownButtons(filter, index);

    this.queryParamsStore.updateFilter(filter);

    this._searchService.search([]);
  }

  public loadMore(aggregation: AggregationListEx, index: number): void {
    this._aggregationsService.loadMore(
      runInInjectionContext(this._injector, () => buildQuery({ filters: getState(this.queryParamsStore).filters as ApiFilter })),
      aggregation
    ).subscribe((aggregation) => {
      this.filterDropdowns.update((filters: FilterDropdown[]) => {
        if (filters[index].aggregation.column === aggregation.column) {
          filters[index].aggregation = aggregation as AggregationEx;
        }
        return filters;
      });
    });
  }

  public dateFilterRefreshed(filter: Filter): void {
    this.updateDateDropdownButton(filter);

    this._cdr.detectChanges();
  }

  public dateFilterUpdated(filter: Filter): void {
    this.queryParamsStore.updateFilter(filter);
    this._searchService.search([]);
  }

  public clearFilters(): void {
    // clear internal filters
    this.aggregations.forEach((filter: AggregationComponent) => filter.clearFilters(false));

    // clear dropdowns state
    this.filterDropdowns.update((filters: FilterDropdown[]) =>
      filters.map((filter: FilterDropdown) => ({ ...filter, currentFilter: undefined, moreFiltersCount: undefined }))
    )

    this.queryParamsStore.patch({ filters: [] });

    this._searchService.search([]);
  }


  private buildFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    const dropdowns = (aggregations as AggregationEx[])
      .map((aggregation) => {
        const itemCustomizations = this.appStore.getAggregationItemsCustomization(aggregation.column);

        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);

        aggregation?.items?.forEach((item: AggregationListItem) => {
          item.$selected = f?.values.includes(item.value?.toString() ?? '') || false;
          item.icon = itemCustomizations?.find(it => it.value === item.value)?.icon;
        });

        return aggregation;
      })
      .map((aggregation) => {
        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);
        const more = f?.values.length ? f.values.length - 1 : undefined;

        const {items} = aggregation;
        if(items) {
          // filter out items that are not selected
          // find the selected items who is the first values of filter
          const item = items.filter((item) => item.$selected).find((item) => f?.values[0] === item.value);
          if(item) {
            return ({
              label: aggregation.name,
              aggregation: aggregation,
              icon: this.appStore.getAggregationIcon(aggregation.column),
              currentFilter: f,
              value: { text: f?.values[0], display: item.display || item.value },
              moreFiltersCount: more,
            })
          }
        }

        return ({
          label: aggregation.name,
          aggregation: aggregation,
          icon: this.appStore.getAggregationIcon(aggregation.column),
          currentFilter: f,
          value: { text: f?.values[0] },
          moreFiltersCount: more,
        })
      });

    return dropdowns as FilterDropdown[];
  }

  private updateDropdownButtons(filter: Filter, index: number): void {
    this.filterDropdowns.update((filters: FilterDropdown[]) => {
      filters[index].currentFilter = filter;
      filters[index].moreFiltersCount = filter.values.length - 1;

      return filters;
    });
  }

  private updateDateDropdownButton(filter: Filter): void {
    this.dateFilterDropdown.update((value) => {
      if (value) {
        value.currentFilter = filter;
      }
      return value;
    });
  }

  private getFilterValue(filter?: Filter): { operator?: string, text: string } | undefined {
    if (!filter) return undefined;

    if (filter.operator === 'between') return { text: `[${filter.values[0]} - ${filter.values[1]}]` };
    if (filter.operator === 'gte') return { operator: "&#8805;", text: filter.values[0] };
    if (filter.operator === 'lte') return { operator: "&#8804;", text: filter.values[0] };
    if (filter.operator === 'lt') return { text: `< ${filter.values[0]}` };
    if (filter.operator === 'gt') return { text: `> ${filter.values[0]}` };

    return { text: filter.values[0] };
  }
}
