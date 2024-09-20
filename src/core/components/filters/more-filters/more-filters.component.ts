import { NgClass } from '@angular/common';
import { Component, Injector, OnDestroy, QueryList, ViewChildren, effect, inject, input, runInInjectionContext, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { Subscription } from 'rxjs';

import { Aggregation, LegacyFilter } from '@sinequa/atomic';
import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, AppStore, CFilter, CFilterItem, FilterDropdown, QueryParamsStore, SearchService, buildQuery, cn } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipe/syslang';

import { AggregationComponent } from '../aggregation/aggregation.component';
import { DATE_FILTER_NAME, FILTERS_COUNT } from '../filters.component';

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-more-filters',
  standalone: true,
  imports: [NgClass, AggregationComponent, SyslangPipe, TranslocoPipe],
  templateUrl: './more-filters.component.html',
  styles: [`
    :host {
      scrollbar-width: none;
    }
  `],
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class MoreFiltersComponent implements OnDestroy {
  cn = cn;

  @ViewChildren(AggregationComponent) aggregations!: QueryList<AggregationComponent>;

  readonly searchable = input<boolean>(true);

  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly hasFilters = signal<LegacyFilter[]>([]);
  readonly hasAppliedFilters = signal<boolean[]>([]);
  readonly filterCounts = signal<number[]>([]);

  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);
  private readonly aggregationsService = inject(AggregationsService);
  private readonly queryParamsStore = inject(QueryParamsStore);

  private readonly appStore = inject(AppStore);
  private readonly injector = inject(Injector);

  private readonly subscriptions = new Subscription();

  constructor() {
    effect(() => {
      const { queryName } = this.route.snapshot.data;
      const aggregations = this.aggregationsService.getSortedAggregations(queryName);

      if (aggregations.length === 0) return;

      // create filters with only aggregations that are authorized and not already shown
      const filterDropdowns = this.buildMoreFilterDropdownsFromAggregations(
        aggregations.splice(FILTERS_COUNT)
          .filter(agg => agg.name !== DATE_FILTER_NAME)
          .filter(agg => agg.items !== undefined && agg.items.length > 0)
      );

      untracked(() => this.filterDropdowns.set(filterDropdowns));

    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public applyFilter(index: number) {
    const filter = this.hasFilters()[index] || [];
    this.queryParamsStore.updateFilter(filter);

    this.updateFiltersFlags(filter, index);

    this.searchService.search([]);
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
    this.searchService.search([]);
  }

  public loadMore(aggregation: AggregationListEx, index: number): void {
    this.aggregationsService.loadMore(
      runInInjectionContext(this.injector, () => buildQuery({ filters: getState(this.queryParamsStore).filters })),
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
          if(filter.display)
            flattenedValues.push(filter.display);
        }
        if (filter.filters) {
          extractValues(filter.filters as LegacyFilter[]);
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
        const { items = [], display = aggregation.name, icon, hidden } = this.appStore.getAggregationCustomization(aggregation.column) as CFilter || {};

        aggregation?.items?.forEach((item: AggregationListItem) => {
          const valueToSearch = aggregation.valuesAreExpressions ? item.display : item.value;
          item.$selected = flattenedValues.includes(valueToSearch ?? '') || false;
          item.icon = items?.find((it: CFilterItem) => it.value === item.value)?.icon;
        });

        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);
        const count = aggregation.isDistribution && f?.operator === 'and'
          ? 1
          : (Array.isArray(f?.filters))
            ? f.filters.length : f ? 1
            : undefined;

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
          icon,
          firstFilter: f,
          moreFiltersCount: count,
          hidden
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
      values[index] = Array.isArray(filter?.filters) ? filter.filters?.length || 0 : 0;
      return values;
    });
  }

}
