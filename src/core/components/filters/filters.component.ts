import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, Injector, ViewChildren, computed, effect, inject, runInInjectionContext, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { Aggregation, LegacyFilter } from '@sinequa/atomic';
import { AggregationEx, AggregationListEx, AggregationListItem, AggregationsService, AppStore, CAggregation, CAggregationItem, CFilter, CFilterItem, FilterDropdown, FocusWithArrowKeysDirective, QueryParamsStore, SearchService, buildQuery, cn } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipe/syslang';
import { DropdownComponent } from '../dropdown';
import { AggregationComponent } from './aggregation/aggregation.component';
import { DateFilterComponent } from './date-filter/date-filter.component';
import { MoreFiltersComponent } from './more-filters/more-filters.component';

export const FILTERS_COUNT = 5;
export const DATE_FILTER_NAME = "Modified";

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-filters',
  standalone: true,
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
  imports: [
    NgClass,
    AsyncPipe,
    DateFilterComponent,
    AggregationComponent,
    MoreFiltersComponent,
    FocusWithArrowKeysDirective,
    DropdownComponent,
    TranslocoPipe,
    SyslangPipe
  ],
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class FiltersComponent {
  @ViewChildren(AggregationComponent) aggregations!: AggregationComponent[];

  cn = cn;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly aggregationsService = inject(AggregationsService);
  private readonly searchService = inject(SearchService);
  private readonly appStore = inject(AppStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  readonly filters = computed(() => getState(this.queryParamsStore).filters || []);
  readonly hasMoreFilters = signal<boolean>(false);
  readonly filterDropdowns = signal<FilterDropdown[]>([]);
  readonly dateFilterDropdown = signal<FilterDropdown | undefined>(undefined);

  readonly moreFiltersCount = computed(() => {
    const { filters = [] } = getState(this.queryParamsStore);

    // count more filters
    return filters
      .filter(f => this.moreFiltersColumns.includes(f.field))
      .reduce((acc, f) => {
        const { value, values, filters } = f;
        if (value) acc++;
        if (values) acc += values.length;
        if (filters) acc += filters.length;
        return acc
      }, 0);
  });


  moreFiltersColumns: string[] = [];

  constructor() {

    effect(() => {
      const { queryName } = this.route.snapshot.data;
      const aggregations = this.aggregationsService.getSortedAggregations(queryName);

      if (aggregations.length === 0) return;

      const dateAggregation = aggregations?.find(agg => agg.name === DATE_FILTER_NAME) as AggregationListEx

      if (dateAggregation) {
        const filter = this.queryParamsStore.getFilterFromColumn(dateAggregation.column);

        this.dateFilterDropdown.set({
          label: 'Date',
          aggregation: dateAggregation,
          firstFilter: filter,
          icon: 'far fa-calendar-day'
        });
      }

      // remove date filter from the list of filters because it is displayed separately
      const resolvedAggregations = [...aggregations.filter(aggregation => aggregation.name !== DATE_FILTER_NAME)];

      const filterDropdowns = this.buildFilterDropdownsFromAggregations(resolvedAggregations.slice(0, FILTERS_COUNT));

      untracked(() => {
        if (resolvedAggregations.length > FILTERS_COUNT)
          this.hasMoreFilters.set(true);

        this.moreFiltersColumns = resolvedAggregations
          .slice(FILTERS_COUNT)
          .map(a => a.column);

        this.filterDropdowns.set(filterDropdowns);
      });

    }, { allowSignalWrites: true })
  }

  public filterUpdated(filter: LegacyFilter, index: number): void {
    this.updateDropdownButtons(filter, index);
    this.queryParamsStore.updateFilter(filter);
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

  public dateFilterRefreshed(filter: LegacyFilter): void {
    this.updateDateDropdownButton(filter);
    this.cdr.detectChanges();
  }

  public dateFilterUpdated(filter: LegacyFilter): void {
    this.queryParamsStore.updateFilter(filter);
    this.searchService.search([]);
  }

  public clearFilters(): void {
    // clear internal filters
    this.aggregations.forEach((filter: AggregationComponent) => filter.clearFilters(false));

    // clear dropdowns state
    this.filterDropdowns.update((filters: FilterDropdown[]) =>
      filters.map((filter: FilterDropdown) => ({ ...filter, currentFilter: undefined, moreFiltersCount: undefined }))
    )

    this.queryParamsStore.patch({ filters: [] });

    this.searchService.search([]);
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

  /**
   * Builds an array of filter dropdowns from the given aggregations.
   *
   * @param aggregations - An array of aggregations.
   * @returns An array of filter dropdowns.
   */
  private buildFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    const { filters = [] } = getState(this.queryParamsStore);
    const flattenedValues = this.flattenFilters(filters);

    const dropdowns = (aggregations as AggregationEx[])
      .map((aggregation) => {
        const { items = [] } = this.appStore.getAggregationCustomization(aggregation.column) as CFilter || {};

        aggregation?.items?.forEach((item: AggregationListItem) => {
          item.$selected = flattenedValues.includes(item.value?.toString() ?? '') || false;
          item.icon = items?.find((it: CFilterItem ) => it.value === item.value)?.icon;
        });

        const { display = aggregation.name, icon, hidden } = this.appStore.getAggregationCustomization(aggregation.column) as CFilter || {};
        const f = this.queryParamsStore.getFilterFromColumn(aggregation.column);
        const more = f?.filters?.length ? f.filters.length - 1 : undefined;

        return ({
          label: display,
          aggregation: aggregation,
          icon,
          firstFilter: f,
          moreFiltersCount: more,
          hidden
        });
      });

    return dropdowns;
  }

  private updateDropdownButtons(filters: LegacyFilter, index: number): void {
    this.filterDropdowns.update((f: FilterDropdown[]) => {
      f[index].firstFilter = filters;
      f[index].moreFiltersCount = filters.filters?.length || 1 - 1;

      return f;
    });
  }

  private updateDateDropdownButton(filter: LegacyFilter): void {
    this.dateFilterDropdown.update((value) => {
      if (value) {
        value.firstFilter = filter;
      }
      return value;
    });
  }

}
