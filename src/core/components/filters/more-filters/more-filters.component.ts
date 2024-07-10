import { Component, Injector, OnDestroy, QueryList, ViewChildren, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, LegacyFilter } from '@sinequa/atomic';
import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, AggregationsStore, AppStore, CAggregation, CAggregationItem, FilterDropdown, QueryParamsStore, SearchService, buildQuery } from '@sinequa/atomic-angular';

import { AggregationComponent } from '../aggregation/aggregation.component';
import { DATE_FILTER_NAME, FILTERS_COUNT } from '../filters.component';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [AggregationComponent, TranslocoPipe],
  templateUrl: './more-filters.component.html',
  styles: [`
    :host {
      scrollbar-width: none;
    }
  `],
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class MoreFiltersComponent implements OnDestroy {
  @ViewChildren(AggregationComponent) aggregations!: QueryList<AggregationComponent>;

  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly hasFilters = signal<LegacyFilter[]>([]);
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
      // as slice mutates the array, we need to clone it first
      // and then remove the first FILTERS_COUNT elements
      // to get the aggregations that are not shown in the filters
      // and remove also the "Modified" aggregation
      const aggregations = [...getState(this._aggregationsStore).aggregations];

      // create filters with only aggregations that are authorized and not already shown
      const filterDropdowns = this.buildMoreFilterDropdownsFromAggregations(
        aggregations.splice(FILTERS_COUNT)
          .filter(agg => agg.name !== DATE_FILTER_NAME)
          .filter(agg => agg.items !== undefined && agg.items.length > 0)
      );

      this.filterDropdowns.set(filterDropdowns);

    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public applyFilter(index: number) {
    const filter = this.hasFilters()[index] || [];
    this.queryParamsStore.updateFilter(filter);

    this.updateFiltersFlags(filter, index);

    this._searchService.search([]);
  }

  public clearFilter(index: number) {
    this.aggregations.toArray()[index].clearFilters();
    const filter: LegacyFilter = {
      field: this.filterDropdowns()[index].aggregation.column,
      display: ''
    };

    this.updateFiltersFlags(filter, index);


    this.queryParamsStore.updateFilter({
      field: this.filterDropdowns()[index].aggregation.column,
      display: ''
    });
    this._searchService.search([]);
  }

  public loadMore(aggregation: AggregationListEx, index: number): void {
    this._aggregationsService.loadMore(
      runInInjectionContext(this._injector, () => buildQuery({ filters: getState(this.queryParamsStore).filters })),
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

  private updateFiltersFlags(filter: LegacyFilter, index: number) {
    this.updateFilterCounts(filter, index);
    this.updateHasFilters(filter, index);
  }

  private flattenFilters(filters: LegacyFilter[]) {
    let flattenedValues: string[] = [];

    function extractValues(filters: LegacyFilter[]) {
      for (const filter of filters) {
        if (filter.value) {
          flattenedValues.push(filter.value);
        }
        if (filter.filters) {
          extractValues(filter.filters);
        }
      }
    }

    extractValues(filters);
    return flattenedValues;
  }

  private buildMoreFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    const { filters = [] } = getState(this.queryParamsStore);
    const flattenedValues = this.flattenFilters(filters);

    return (aggregations as AggregationEx[])
      .map((aggregation, index) => {
        const { items = [], display = aggregation.name } = this.appStore.getAggregationCustomization(aggregation.column) as CAggregation || aggregation as CAggregation;

        aggregation?.items?.forEach((item: AggregationListItem) => {
          item.$selected = flattenedValues.includes(item.value?.toString() ?? '') || false;
          item.icon = items?.find((it: CAggregationItem) => it.value === item.value)?.icon;
        });

        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);
        const count =  f?.filters?.length ? f.filters.length : f ? 1 : undefined;

        if (f) {
          this.updateFiltersFlags(f, index)
        }

        this.hasAppliedFilters.update((values) => {
          values[index] = !!f;
          return values;
        });

        return ({
          label: display,
          aggregation: aggregation as AggregationEx,
          icon: this.appStore.getAggregationIcon(aggregation.column),
          firstFilter: f,
          moreFiltersCount: count
        })
      });
  }

  protected updateHasFilters(filter: LegacyFilter, index: number): void {
    this.hasFilters.update((values) => {
      values[index] = filter;
      return values;
    });
  }

  private updateFilterCounts(filter: LegacyFilter, index: number): void {
    this.filterCounts.update((values) => {
      values[index] = filter?.filters?.length || 0;
      return values;
    });
  }
}
