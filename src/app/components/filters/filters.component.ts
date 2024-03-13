import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChildren, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, map, tap } from 'rxjs';

import { Aggregation } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { AggregationEx, AggregationListItem, AggregationsService, CustomizationService, SearchService } from '@/app/services';
import { aggregationsStore } from '@/app/stores/aggregations.store';
import { filtersStore } from '@/app/stores/filters.store';
import { Filter } from '@/app/utils/models';

import { AggregationListFilterComponent } from './components/aggregation-list/aggregation-list.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { MoreFiltersComponent } from './components/more-filters/more-filters.component';
import { FilterDropdown } from './models/filter-dropdown';

const AUTHORIZED_FILTERS = ['treepath', 'geo', 'person', 'doctype', 'authors', 'enginecsv1'];

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [NgClass, AsyncPipe, DateFilterComponent, AggregationListFilterComponent, MoreFiltersComponent, FocusWithArrowKeysDirective],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  @ViewChildren(AggregationListFilterComponent) public aggregationListFilters!: AggregationListFilterComponent[];

  private readonly customizationService = inject(CustomizationService);
  aggregationsService = inject(AggregationsService);

  private readonly searchService = inject(SearchService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly filters = toSignal(filtersStore.current$);
  protected readonly moreFiltersCount = signal<number>(0);

  protected readonly filterDropdowns = signal<FilterDropdown[]>([]);
  protected readonly dateFilterDropdown = signal<FilterDropdown | undefined>(undefined);

  private readonly subscriptions = new Subscription();

  private readonly activatedRoute = inject(ActivatedRoute)


  constructor() {
    this.subscriptions.add(
      combineLatest([aggregationsStore.next$, filtersStore.next$])
        .pipe(
          map(([aggregations,]) => {
            return aggregations;
          }),
          tap((aggregations) => this.dateFilterDropdown.set({
            label: 'Date',
            aggregation: aggregations?.find(agg => agg.name === "date") as AggregationEx || null,
            iconClass: 'far fa-calendar-day'
          })),
          map((aggregations: Aggregation[] | undefined) => aggregations?.filter(a => AUTHORIZED_FILTERS.includes(a.column)) ?? []),
          map((aggregations: Aggregation[]) => aggregations.sort((a, b) => AUTHORIZED_FILTERS.indexOf(a.column) - AUTHORIZED_FILTERS.indexOf(b.column))),
        )
        .subscribe((aggregations) => {
          console.log("filters and aggregations", aggregations);
          this.filterDropdowns.set(this.buildFilterDropdownsFromAggregations(aggregations ?? []))
        })
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.activatedRoute.queryParams.subscribe((queryParams) => {
        let filters;
        if (queryParams['f']) {
          filters = JSON.parse(queryParams['f']);
        }
        filtersStore.set(filters);
      })
    );
  }

  public filterUpdated(filter: Filter, index: number): void {
    this.updateDropdownButtons(filter, index);

    filtersStore.update(filter);
    this.searchService.search([]);
  }

  loadMore(aggregation: AggregationEx, index: number): void {
    this.aggregationsService.loadMore(aggregation).subscribe((aggregation) => {
      this.filterDropdowns.update((filters: FilterDropdown[]) => {
        if (filters[index].aggregation.column === aggregation.column) {
          filters[index].aggregation = aggregation;
        }
        return filters;
      });
    });
  }

  public dateFilterRefreshed(filter: Filter): void {
    this.updateDateDropdownButton(filter);

    this.cdr.detectChanges();
  }

  public dateFilterUpdated(filter: Filter): void {
    this.updateDateDropdownButton(filter);

    filtersStore.update(filter);
    this.searchService.search([]);
  }

  public clearFilters(): void {
    // clear internal filters
    this.aggregationListFilters.forEach((filter: AggregationListFilterComponent) => filter.clearFilters(false));

    // clear dropdowns state
    this.filterDropdowns.update((filters: FilterDropdown[]) =>
      filters.map((filter: FilterDropdown) => ({ ...filter, currentFilter: undefined, moreFiltersCount: undefined }))
    )

    console.log("clear filters", this.filterDropdowns());

    this.moreFiltersCount.set(0);
    filtersStore.clear();

    this.searchService.search([]);
  }

  protected moreFiltersCountUpdated(count: number): void {
    this.moreFiltersCount.set(count);
  }

  private buildFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    const dropdowns = aggregations
      .map((aggregation: Aggregation) => {
        const itemCustomizations = this.customizationService.getAggregationItemsCustomization(aggregation.column);

        const f = filtersStore.state?.find(f => f.column === aggregation.column);

        aggregation?.items?.forEach((item: AggregationListItem) => {
          item.$selected = f?.values.includes(item.value?.toString() ?? '') || false;
          item.iconClass = itemCustomizations?.find(it => it.value === item.value)?.iconClass;
        });

        return aggregation;
      })
      .map((aggregation) => {
        const f = filtersStore.state?.find(f => f.column === aggregation.column);
        const more = f?.values.length ? f.values.length - 1 : undefined;
        return ({
          label: aggregation.name,
          aggregation: aggregation,
          iconClass: this.customizationService.getAggregationIconClass(aggregation.column),
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
