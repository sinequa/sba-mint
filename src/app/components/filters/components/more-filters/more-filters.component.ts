import { Component, EventEmitter, OnDestroy, Output, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { Subscription, map } from 'rxjs';

import { Aggregation } from '@sinequa/atomic';

import { CustomizationService, SearchService } from '@/app/services';
import { aggregationsStore } from '@/app/stores/aggregations.store';
import { Filter } from '@/app/utils/models';

import { queryParamsStore } from '@/app/stores/query-params.store';
import { FilterDropdown } from '../../models/filter-dropdown';
import { AggregationListFilterComponent } from '../aggregation-list/aggregation-list.component';

const AUTHORIZED_MORE_FILTERS = ['treepath', 'geo', 'company'];

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [AggregationListFilterComponent],
  templateUrl: './more-filters.component.html',
  styleUrl: './more-filters.component.scss'
})
export class MoreFiltersComponent implements OnDestroy {
  @ViewChildren(AggregationListFilterComponent) public aggregationListFilters!: QueryList<AggregationListFilterComponent>;

  @Output() public count = new EventEmitter<number>();

  protected readonly filterDropdowns = signal<FilterDropdown[]>([]);
  protected hasFilters = signal<boolean[]>([]);
  protected filterCounts = signal<number[]>([]);

  private readonly search = inject(SearchService);
  private readonly customizationService = inject(CustomizationService);

  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      aggregationsStore.next$
        .pipe(
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

  public applyFilter(filterIndex: number): void {
    const filter: Filter = {
      column: this.filterDropdowns()[filterIndex].column,
      label: this.aggregationListFilters.toArray()[filterIndex].getFilters()[0],
      values: this.aggregationListFilters.toArray()[filterIndex].getFilters()
    };

    queryParamsStore.updateFilter(filter);
    this.search.search([]);
  }

  public clearFilter(filterIndex: number): void {
    this.aggregationListFilters.toArray()[filterIndex].clearFilters();

    queryParamsStore.updateFilter({
      column: this.filterDropdowns()[filterIndex].column,
      label: undefined,
      values: []
    });
    this.search.search([]);
  }

  protected filterRefreshed(filter: Filter, index: number): void {
    this.updateFilterCounts(filter, index);
    this.updateHasFilters(filter, index);
    this.updateTotalFiltersCount();

  }

  protected filterUpdated(filter: Filter, index: number): void {
    this.updateHasFilters(filter, index);

  }

  protected filterValueChanged(filter: Filter, index: number): void {
    this.updateHasFilters(filter, index);
  }

  private buildMoreFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    return aggregations.map((aggregation: Aggregation) => ({
      label: aggregation.name,
      column: aggregation.column,
      iconClass: this.customizationService.getAggregationIconClass(aggregation.column)
    }));
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
    this.count.emit(this.filterCounts().reduce((sum: number, count: number) => sum + count, 0));
  }
}
