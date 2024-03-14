import { Component, EventEmitter, Injector, OnDestroy, Output, QueryList, ViewChildren, inject, runInInjectionContext, signal } from '@angular/core';
import { Subscription, map, tap } from 'rxjs';

import { Aggregation, Filter as ApiFilter } from '@sinequa/atomic';

import { AggregationEx, AggregationsService, CustomizationService, SearchService } from '@/app/services';
import { aggregationsStore } from '@/app/stores/aggregations.store';
import { Filter } from '@/app/utils/models';

import { queryParamsStore } from '@/app/stores/query-params.store';
import { buildQuery } from '@/app/utils';
import { FilterDropdown } from '../../models/filter-dropdown';
import { AggregationComponent } from '../aggregation/aggregation.component';

const AUTHORIZED_MORE_FILTERS = ['treepath', 'geo', 'company'];

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [AggregationComponent],
  templateUrl: './more-filters.component.html',
  styleUrl: './more-filters.component.scss'
})
export class MoreFiltersComponent implements OnDestroy {
  @ViewChildren(AggregationComponent) public aggregations!: QueryList<AggregationComponent>;

  @Output() public onCountChange = new EventEmitter<number>();

  protected readonly filterDropdowns = signal<FilterDropdown[]>([]);
  protected hasFilters = signal<boolean[]>([]);
  protected filterCounts = signal<number[]>([]);

  private readonly search = inject(SearchService);
  private readonly customizationService = inject(CustomizationService);
  private readonly aggregationsService = inject(AggregationsService);
  private readonly injector = inject(Injector);

  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      aggregationsStore.next$
        .pipe(
          tap(() => "TRIGGERED"),
          map((aggregations: Aggregation[] | undefined) => aggregations?.filter(a => AUTHORIZED_MORE_FILTERS.includes(a.column)) ?? []),
          map((aggregations: Aggregation[]) => aggregations.sort((a, b) => AUTHORIZED_MORE_FILTERS.indexOf(a.column) - AUTHORIZED_MORE_FILTERS.indexOf(b.column)))
        )
        .subscribe(
          (aggregations) => this.filterDropdowns.set(this.buildMoreFilterDropdownsFromAggregations(aggregations ?? []))
        )
    );
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

    this.search.search([]);
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

    this.search.search([]);
  }

  public loadMore(aggregation: AggregationEx, index: number): void {
    this.aggregationsService.loadMore(
      runInInjectionContext(this.injector, () => buildQuery({ filters: queryParamsStore.state?.filters as ApiFilter })),
      aggregation
    ).subscribe((aggregation) => {
      this.filterDropdowns.update((filters: FilterDropdown[]) => {
        if (filters[index].aggregation.column === aggregation.column) {
          filters[index].aggregation = aggregation;
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
        aggregation: aggregation,
        column: aggregation.column,
        iconClass: this.customizationService.getAggregationIconClass(aggregation.column),
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
