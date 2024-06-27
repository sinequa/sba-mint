import { Component, Injector, OnDestroy, QueryList, ViewChildren, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, Filter as ApiFilter, CCApp, resolveToColumnName } from '@sinequa/atomic';
import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, AggregationsStore, AppStore, Filter, FilterDropdown, QueryParamsStore, SearchService, buildQuery, getCurrentQueryName } from '@sinequa/atomic-angular';

import { getAuthorizedFilters } from '../filter';
import { FILTERS_COUNT } from '../filters.component';
import { AggregationComponent } from '../aggregation/aggregation.component';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [AggregationComponent, TranslocoPipe],
  templateUrl: './more-filters.component.html',
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class MoreFiltersComponent implements OnDestroy {
  @ViewChildren(AggregationComponent) aggregations!: QueryList<AggregationComponent>;

  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly hasFilters = signal<boolean[]>([]);
  readonly hasAppliedFilters = signal<boolean[]>([]);
  readonly filterCounts = signal<number[]>([]);

  private readonly _searchService = inject(SearchService);
  private readonly _aggregationsService = inject(AggregationsService);
  private readonly _aggregationsStore = inject(AggregationsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  private readonly appStore = inject(AppStore);
  private readonly _injector = inject(Injector);

  private readonly subscriptions = new Subscription();

  constructor() {
    effect(() => {
      const authorizedFilters = getAuthorizedFilters(this._injector);

      if (!authorizedFilters) return;

      const { aggregations } = getState(this._aggregationsStore);

      const resolvedAggregations = authorizedFilters.reduce((acc, name) => {
        let aggregation = aggregations.find(agg => agg.column === name);

        if (!aggregation) {
          const aggColumn = runInInjectionContext(this._injector, () => resolveToColumnName(name, getState(this.appStore) as CCApp, getCurrentQueryName()))

          aggregation = aggregations.find(agg => agg.column === aggColumn);
        }

        if (aggregation) acc.push(aggregation);

        return acc;
      }, [] as Aggregation[]);

      // create filters with only aggregations that are authorized and not already shown
      const filterDropdowns = this.buildMoreFilterDropdownsFromAggregations(resolvedAggregations.splice(FILTERS_COUNT));

      this.filterDropdowns.set(filterDropdowns);

    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public applyFilter(index: number) {
    this.aggregations.toArray()[index].apply();

    const filters = this.aggregations.toArray()[index].aggregation().items
      .filter((item: AggregationListItem) => item.$selected)
      .map((item: AggregationListItem) => item.value?.toString() || '');

    const filter: Filter = {
      column: this.filterDropdowns()[index].aggregation.column,
      label: filters[0],
      values: filters
    };

    this.updateFiltersCount(filter, index);
    this.queryParamsStore.updateFilter(filter);
    this._searchService.search([]);
  }

  public clearFilter(index: number) {
    this.aggregations.toArray()[index].clearFilters();
    const filter: Filter = {
      column: this.filterDropdowns()[index].aggregation.column,
      label: undefined,
      values: []
    };

    this.updateFiltersCount(filter, index);
    this.updateHasFilters(filter, index);


    this.queryParamsStore.updateFilter({
      column: this.filterDropdowns()[index].aggregation.column,
      label: undefined,
      values: []
    });
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

  private updateFiltersCount(filter: Filter, index: number) {
    this.updateFilterCounts(filter, index);
    this.updateHasFilters(filter, index);
  }

  private buildMoreFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    return (aggregations as AggregationEx[])
      .map((aggregation, index) => {
        const { items = [], name = aggregation.name } = this.appStore.getAggregationCustomization(aggregation.column) as AggregationEx || aggregation as AggregationEx;

        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);
        const count = f?.values.length ?? undefined;

        if (f) {
          this.updateFiltersCount(f, index)
        }

        this.hasAppliedFilters.update((values) => {
          values[index] = !!f;
          return values;
        });

        aggregation?.items?.forEach((item: AggregationListItem) => {
          item.$selected = f?.values.includes(item.value?.toString() ?? '') || false;
          item.icon = items?.find((it: AggregationListItem) => it.value === item.value)?.icon;
        });

        return ({
          label: name,
          aggregation: aggregation as AggregationEx,
          column: aggregation.column,
          currentFilter: f,
          icon: this.appStore.getAggregationIcon(aggregation.column),
          moreFiltersCount: count
        })
      });
  }

  protected updateHasFilters(filter: Filter, index: number): void {
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
}
