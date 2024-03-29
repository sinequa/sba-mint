import { Component, EventEmitter, Injector, OnDestroy, Output, QueryList, ViewChildren, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, Filter as ApiFilter } from '@sinequa/atomic';

import { AggregationEx, AggregationListEx, AggregationsService, SearchService } from '@/app/services';
import { appStore, queryParamsStore } from '@/app/stores';
import { buildQuery } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { AggregationsStore } from '@/stores';
import { getAuthorizedFilters } from '../../filter';
import { FILTERS_COUNT } from '../../filters.component';
import { FilterDropdown } from '../../models/filter-dropdown';
import { AggregationComponent } from '../aggregation/aggregation.component';

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [AggregationComponent],
  templateUrl: './more-filters.component.html',
  styleUrl: './more-filters.component.scss'
})
export class MoreFiltersComponent implements OnDestroy {
  @ViewChildren(AggregationComponent) aggregations!: QueryList<AggregationComponent>;

  @Output() onCountChange = new EventEmitter<number>();

  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly hasFilters = signal<boolean[]>([]);
  readonly filterCounts = signal<number[]>([]);

  private readonly _search = inject(SearchService);
  private readonly _aggregationsService = inject(AggregationsService);
  private readonly _aggregationsStore = inject(AggregationsStore);
  private readonly _injector = inject(Injector);

  private readonly subscriptions = new Subscription();

  constructor() {
    effect(() => {
      const { aggregations } = getState(this._aggregationsStore);
      const authorizedFilters = getAuthorizedFilters(this._injector);

      if (!authorizedFilters) return;

      this.filterDropdowns.set(this.buildMoreFilterDropdownsFromAggregations(aggregations
        .filter(a => authorizedFilters.includes(a.column))
        .sort((a, b) => authorizedFilters.indexOf(a.column) - authorizedFilters.indexOf(b.column))
        .splice(FILTERS_COUNT)
      ));
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public applyFilter(index: number): void {
    const filters = this.aggregations.toArray()[index].aggregation().items
      .filter(item => item.$selected)
      .map((item) => item.value?.toString() || '');

    const filter: Filter = {
      column: this.filterDropdowns()[index].aggregation.column,
      label: filters[0],
      values: filters
    };

    this.updateFiltersCount(filter, index);
    queryParamsStore.updateFilter(filter);

    this._search.search([]);
  }

  public clearFilter(index: number): void {
    this.aggregations.toArray()[index].clearFilters();

    const filters = this.aggregations.toArray()[index].aggregation().items
      .filter(item => item.$selected)
      .map((item) => item.value?.toString() || '');
    const filter: Filter = {
      column: this.filterDropdowns()[index].aggregation.column,
      label: undefined,
      values: filters
    };

    this.updateFiltersCount(filter, index);


    queryParamsStore.updateFilter({
      column: this.filterDropdowns()[index].aggregation.column,
      label: undefined,
      values: []
    });

    this._search.search([]);
  }

  public loadMore(aggregation: AggregationListEx, index: number): void {
    this._aggregationsService.loadMore(
      runInInjectionContext(this._injector, () => buildQuery({ filters: queryParamsStore.state?.filters as ApiFilter })),
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

  /**
   * Updates the selected filter and triggers the updateHasFilters method.
   *
   * @param filter - The filter to be selected.
   * @param index - The index of the filter.
   */
  protected filterUpdated(filter: Filter, index: number): void {
    this.updateHasFilters(filter, index);
  }

  private updateFiltersCount(filter: Filter, index: number) {
    this.updateFilterCounts(filter, index);
    this.updateTotalFiltersCount();
    this.updateHasFilters(filter, index);
  }

  private buildMoreFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    return aggregations.map((aggregation: Aggregation) => {
      const f = queryParamsStore.getFilterFromColumn(aggregation.column);
      const count = f?.values.length ?? undefined;

      return ({
        label: aggregation.name,
        aggregation: aggregation as AggregationEx,
        column: aggregation.column,
        icon: appStore.getAggregationIcon(aggregation.column),
        moreFiltersCount: count
      })
    });
  }

  private updateHasFilters(filter: Filter, index: number): void {
    this.hasFilters.update((values) => {
      values[index] = filter.values.length > 0;
      return values;
    });
  }

  private updateFilterCounts(filter: Filter, index: number): void {
    this.filterCounts.update((values) => {
      values[index] = filter.values.length;
      return values;
    });
  }

  private updateTotalFiltersCount(): void {
    this.onCountChange.emit(this.filterCounts().reduce((sum: number, count: number) => sum + count, 0));
  }
}
