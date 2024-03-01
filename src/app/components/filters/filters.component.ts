import { CustomizationService } from '@/app/services/customization.service';
import { SearchService } from '@/app/services/search.service';
import { Filter } from '@/app/utils/api-filter-translator';
import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChildren, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Aggregation } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';
import { Subscription, map } from 'rxjs';
import { aggregationsStore } from '../../stores/aggregations.store';
import { filtersStore } from '../../stores/filters.store';
import { AggregationListFilterComponent } from './components/aggregation-list/aggregation-list.component';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { MoreFiltersComponent } from './components/more-filters/more-filters.component';
import { FilterDropdown } from './filters.models';

const AUTHORIZED_FILTERS = ['treepath', 'doctype', 'authors', 'enginecsv1'];

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [NgClass, AsyncPipe, DateFilterComponent, AggregationListFilterComponent, MoreFiltersComponent, FocusWithArrowKeysDirective],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {
  @ViewChildren(AggregationListFilterComponent) public aggregationListFilters!: AggregationListFilterComponent[];

  private readonly customizationService = inject(CustomizationService);
  private readonly searchService = inject(SearchService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly filters = toSignal(filtersStore.current$);

  protected readonly filterDropdowns = signal<FilterDropdown[]>([]);
  protected readonly moreFiltersCount = signal<number>(0);
  protected readonly dateFilterDropdown = signal<FilterDropdown>({ label: 'Date', column: 'date', iconClass: 'far fa-calendar-day' });

  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      aggregationsStore.next$
        .pipe(
          map((aggregations: Aggregation[] | undefined) => aggregations?.filter(a => AUTHORIZED_FILTERS.includes(a.column)) ?? []),
          map((aggregations: Aggregation[]) => aggregations.sort((a, b) => AUTHORIZED_FILTERS.indexOf(a.column) - AUTHORIZED_FILTERS.indexOf(b.column)))
        )
        .subscribe((aggregations) => this.filterDropdowns.set(this.buildFilterDropdownsFromAggregations(aggregations ?? [])))
    );
  }

  public filterRefreshed(filter: Filter, index: number): void {
    this.updateDropdownButtons(filter, index);

    this.cdr.detectChanges();
  }

  public filterUpdated(filter: Filter, index: number): void {
    this.updateDropdownButtons(filter, index);

    filtersStore.update(filter);
    this.searchService.search([]);
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
      filters.map((filter: FilterDropdown) => Object.assign(filter, { currentFilter: undefined, moreFilters: undefined }))
    )

    filtersStore.clear();
    this.searchService.search([]);
  }

  protected moreFiltersCountUpdated(count: number): void {
    this.moreFiltersCount.set(count);
  }

  private buildFilterDropdownsFromAggregations(aggregations: Aggregation[]): FilterDropdown[] {
    return aggregations.map((aggregation: Aggregation) => ({
      label: aggregation.name,
      column: aggregation.column,
      iconClass: this.customizationService.getAggregationIconClass(aggregation.column),
      currentFilter: undefined,
      moreFilters: undefined
    }));
  }

  private updateDropdownButtons(filter: Filter, index: number): void {
    this.filterDropdowns.update((filters: FilterDropdown[]) => {
      filters[index].currentFilter = filter.values[0];
      filters[index].moreFilters = filter.values.length - 1;

      return filters;
    });
  }

  private updateDateDropdownButton(filter: Filter): void {
    this.dateFilterDropdown.update((value) => {
      value.currentFilter = filter.label;
      return value;
    });
  }
}
