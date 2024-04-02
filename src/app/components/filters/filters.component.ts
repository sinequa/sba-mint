import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, OnInit, ViewChildren, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, Filter as ApiFilter } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, SearchService } from '@/app/services';
import { AppStore, QueryParamsStore } from '@/app/stores';
import { Filter, buildQuery } from '@/app/utils';
import { AggregationsStore } from '@/stores';

import { AggregationComponent } from './components/aggregation/aggregation.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { MoreFiltersComponent } from './components/more-filters/more-filters.component';
import { getAuthorizedFilters } from './filter';
import { FilterDropdown } from './models/filter-dropdown';

export const FILTERS_COUNT = 4;

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [NgClass, AsyncPipe, DateFilterComponent, AggregationComponent, MoreFiltersComponent, FocusWithArrowKeysDirective],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  @ViewChildren(AggregationComponent) aggregations!: AggregationComponent[];

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
  readonly moreFiltersCount = signal<number>(0);
  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly dateFilterDropdown = signal<FilterDropdown | undefined>(undefined);


  private readonly _subscriptions = new Subscription();

  constructor() {
    effect(() => {
      const { aggregations } = getState(this._aggregationsStore);
      const authorizedFilters = getAuthorizedFilters(this._injector);

      if (!authorizedFilters) return;

      if (authorizedFilters.length > FILTERS_COUNT)
        this.hasMoreFilters.set(true);

      if (authorizedFilters.includes("#date"))
        this.dateFilterDropdown.set({
          label: 'Date',
          aggregation: aggregations?.find(agg => agg.name === "Modified") as AggregationListEx || null,
          icon: 'far fa-calendar-day'
        });

      this.filterDropdowns.set(this.buildFilterDropdownsFromAggregations(aggregations
        .filter(a => authorizedFilters.includes(a.column))
        .sort((a, b) => authorizedFilters.indexOf(a.column) - authorizedFilters.indexOf(b.column))
        .splice(0, FILTERS_COUNT)
      ));
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
    this.updateDateDropdownButton(filter);

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

    this.moreFiltersCount.set(0);
    this.queryParamsStore.patch({ filters: [] });

    this._searchService.search([]);
  }

  protected moreFiltersCountUpdated(count: number): void {
    this.moreFiltersCount.set(count);
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
        return ({
          label: aggregation.name,
          aggregation: aggregation,
          icon: this.appStore.getAggregationIcon(aggregation.column),
          currentFilter: f?.label,
          moreFiltersCount: more,
        })
      })
    return dropdowns
  }

  private updateDropdownButtons(filter: Filter, index: number): void {
    this.filterDropdowns.update((filters: FilterDropdown[]) => {
      filters[index].currentFilter = filter.values[0];
      filters[index].moreFiltersCount = filter.values.length - 1;

      return filters;
    });
  }

  private updateDateDropdownButton(filter: Filter): void {
    this.dateFilterDropdown.update((value) => {
      if (value) {
        value.currentFilter = filter.label;
      }
      return value;
    });
  }
}
