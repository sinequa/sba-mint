import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { AggregationListItem, AggregationsService, AggregationsStore, AppStore, CFilter, CFilterItem, debouncedSignal, QueryParamsStore } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';

import { getState } from '@ngrx/signals';
import { Aggregation, AggregationItem, fetchSuggestField, FieldValue, LegacyFilter, Suggestion, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationRowComponent } from "./aggregation-row.component";


export type AggEx = Aggregation & {
  display?: string;
  icon?: string;
  hidden?: boolean;
}

@Component({
  selector: 'Aggregation',
  standalone: true,
  templateUrl: './aggregation.component.html',
  styles: [`
    :host {
      display: block;
    }

    .data-list {
      scrollbar-width: thin;
    }
  `],
  imports: [FormsModule, AsyncPipe, ReactiveFormsModule, NgClass, NgIf, AggregationRowComponent, SyslangPipe, TranslocoPipe],
})
export class AggregationComponent {
  /* stores */
  aggregationsStore = inject(AggregationsStore);
  appStore = inject(AppStore);
  queryParamsStore = inject(QueryParamsStore);

  /* services */
  aggregationsService = inject(AggregationsService);


  /**
   * The `name` property is a required input that can be either a string or null.
   * By default, it represents the name of the aggregation column.
   *
   * If you want specify a column name, uses the `kind` input with the `'column'` value.
   *
   * @remarks
   * The `kind` property is an input that can be either "column" or "name".
   */
  name = input.required<string | null>();
  /**
   * Represents the type of aggregation component.
   *
   * Default is "name"
   */
  kind = input<"column" | "name">("name");

  /**
   * A boolean flag indicating whether the component should operate in headless mode.
   * When set to `true`, the component will function without rendering any UI elements.
   *
   * @default false
   */
  headless = input(false);

  /**
   * A boolean flag indicating whether the component is searchable.
   * This property is initialized to `true` by default.
   */
  searchable = input(true);
  selectionCount = signal(0);

  /* aggregation */
  aggregation = computed(() => {
    const state = getState(this.aggregationsStore);
    if (this.name() !== null) {
      const agg: AggEx = this.aggregationsStore.getAggregation(this.name() || '', this.kind()) as AggEx;
      const { items = [], display = agg.name, icon, hidden } = this.appStore.getAggregationCustomization(agg.column) as CFilter || {};
      agg.display = display;
      agg.icon = icon;
      agg.hidden = hidden;

      if (agg.items) {
        const { filters = [] } = getState(this.queryParamsStore);
        const flattenedValues = this.flattenFilters(filters);

        (agg.items as AggregationListItem[]).forEach((item: AggregationListItem) => {
          const valueToSearch = agg.valuesAreExpressions ? item.display : item.value;
          item.$selected = flattenedValues.includes(valueToSearch ?? '') || false;
          item.icon = items?.find((it: CFilterItem) => it.value === item.value)?.icon;
        });
      }

      return (agg?.items) ? agg : null;
    }
    return null
  })

  /* items of the aggretions */
  items = computed(() => {
    if (this.searchedItems()) {
      return this.searchedItems() as AggregationListItem[];
    }
    if (this.aggregation() !== null && this.aggregation()?.items) {
      return this.aggregation()?.items as AggregationListItem[];
    }
    return [];
  })

  /* whether the aggregation has filters */
  hasFilters = computed(() => {
    if (this.aggregation()?.isTree) {
      const allItems = this.getFlattenTreeItems();
      return !!allItems.some(item => item.$selected);
    }
    return !!(this.items().some(item => item.$selected));
  });

  /* search feature */
  searchText = signal('');
  debouncedSearchText = debouncedSignal(this.searchText, 300);

  /* suggestions */
  readonly suggests = signal<Suggestion[] | undefined>(undefined);
  /* searched items */
  readonly searchedItems = computed(() => {
    if (!this.suggests()) return undefined;

    const list: AggregationListItem[] = this.suggests()!.map(suggest => ({
      name: suggest.category,
      value: suggest.normalized || suggest.display || '',
      display: suggest.display,
      column: suggest.id,
      count: 1,
      items: []
    }));
    return list;
  });

  constructor() {
    effect(async () => {
      if (this.debouncedSearchText() === '') {
        this.suggests.set(undefined);
        return;
      }
      const suggests = await fetchSuggestField(this.debouncedSearchText(), [this.aggregation()!.column]);
      this.suggests.set(suggests);
    }, { allowSignalWrites: true });
  }

  /**
 * Clears the current filter for the aggregation column.
 *
 * This method updates the filter in the `queryParamsStore` by setting the display value
 * of the current aggregation column to an empty string.
 */
  clear() {
    this.queryParamsStore.updateFilter({ field: this.aggregation()?.column, display: '' });
  }

  /**
   * Applies the current filters to the query parameters store.
   *
   * - If there are multiple filters, they are wrapped in an "or" filter.
   * - If the aggregation is not a distribution, the filters are merged into a single filter with an "in" operator.
   * - If there is only one filter, it is directly applied.
   * - If there are no filters, the current filters are cleared.
   *
   * After applying the filters, the search text is reset.
   */
  apply() {
    const filters = this.getFilters();

    // if filters length > 1, we need to wrap them in an "or" filter
    if (filters.length > 1) {
      const display = filters[0].display;
      // if aggregation not a distribution, we need to merge the filters into a single filter with an in operator
      // with the values of the filters
      if (this.aggregation()?.isDistribution) {
        this.queryParamsStore.updateFilter({ operator: 'or', filters, field: this.aggregation()?.column, display } as LegacyFilter);
      }
      else {
        const values = filters.map(filter => filter.value);
        this.queryParamsStore.updateFilter({ operator: 'in', field: this.aggregation()?.column, values, display, filters } as LegacyFilter);
      }
    }
    else if (filters.length === 1) {
      this.queryParamsStore.updateFilter(filters[0]);
    }
    else {
      this.clear();
    }

    this.searchText.set('');
  }

  loadMore(): void {
    const q = this.queryParamsStore.getQuery();
    this.aggregationsService.loadMore(q, this.aggregation() as Aggregation).subscribe((aggregation) => {
      this.aggregationsStore.updateAggregation(aggregation);
    });
  }

  /**
   * Updates the selected state of the given item in the aggregation list.
   *
   * @param item - The item to be selected or deselected.
   *
   * This method iterates through the items in the aggregation list and updates
   * the `$selected` property of the item that matches the value of the given item.
   *
   * If the item is selected, the selection count is incremented by 1.
   * If the item is deselected, the selection count is decremented by 1.
   */
  select(item: AggregationListItem) {
    // update the selected state of the item
    this.aggregation()?.items?.forEach((i) => {
      if (i.value === item.value) {
        i.$selected = item.$selected;
      }
    });

    if (item.$selected) {
      this.selectionCount.set(this.selectionCount() + 1);
    }
    else {
      this.selectionCount.set(this.selectionCount() - 1);
    }
  }


  /**
   * Retrieves the appropriate filters based on the aggregation type.
   *
   * If the aggregation is a tree structure, it returns filters specific to trees.
   * Otherwise, it returns filters for a list structure.
   *
   * @returns Filters for either a tree or list aggregation.
   */
  protected getFilters() {
    if (this.aggregation()?.isTree) {
      return this.getFiltersForTree();
    }
    return this.getFiltersForList();
  }

  /**
   * Retrieves the filters for the tree structure.
   *
   * This method collects the selected items from the tree, constructs their paths,
   * and creates a filter object based on these paths. If no items are selected,
   * it returns an empty array.
   *
   * @returns {LegacyFilter[]} An array of filters for the tree structure.
   */
  protected getFiltersForTree(): LegacyFilter[] {
    const field = this.aggregation()?.column;
    const items = this.getFlattenTreeItems()
      .filter(item => item.$selected)
      .map((item) => `/${item.$path}/*` || '');

    if (items.length === 0) return [];

    const filter = { operator: "in", field, values: items, display: items[0] };
    return [filter] as LegacyFilter[];
  }

  /**
   * Retrieves a list of filters based on the selected items.
   *
   * This method filters the items to include only those that are selected,
   * and then maps each selected item to a filter using the `toFilter` method.
   *
   * @returns {LegacyFilter[]} An array of filters corresponding to the selected items.
   */
  protected getFiltersForList(): LegacyFilter[] {
    const items = this.items().filter(item => item.$selected) || [];
    return items.map(item => this.toFilter(item));
  }


  /**
   * Recursively flattens a tree structure of `TreeAggregationNode` items into a single array.
   *
   * @returns {TreeAggregationNode[]} An array containing all nodes from the tree structure, flattened.
   */
  private getFlattenTreeItems(): TreeAggregationNode[] {
    const flattenItems = (items: TreeAggregationNode[]): TreeAggregationNode[] => {
      return items.reduce((flat, item) => {
        return flat.concat(item, item.items ? flattenItems(item.items) : []);
      }, [] as TreeAggregationNode[]);
    };

    return flattenItems(this.items());
  }

  /**
   * Converts an `AggregationItem` to a `LegacyFilter`.
   *
   * @param item - The `AggregationItem` to be converted.
   * @returns A `LegacyFilter` object based on the provided `AggregationItem`.
   *
   * The function performs the following steps:
   * 1. Retrieves the field from the aggregation column.
   * 2. If the aggregation is a distribution, it parses the item value to extract filter expressions.
   *    - The expressions are split by " AND " and mapped to filter objects.
   *    - If two filters are found, they are combined with an "and" operator.
   *    - If one filter is found, it is returned as is.
   *    - Throws an error if the distribution expression cannot be parsed.
   * 3. If the item value is a string, it creates a filter with the "contains" operator.
   * 4. Otherwise, it creates a filter with the item value as a string, number, or boolean.
   *
   * @throws Will throw an error if the distribution expression cannot be parsed.
   */
  private toFilter(item: AggregationItem): LegacyFilter {
    const field = this.aggregation()?.column;

    if (this.aggregation()?.isDistribution) {
      const res = (item.value as string).match(/.*\:\(?([><=\d\-\.AND ]+)\)?/);
      if (res?.[1]) {
        const expr = res?.[1].split(" AND ");
        const filters = expr.map(e => {
          const operator: 'gte' | 'lt' = e.indexOf('>=') !== -1 ? 'gte' : 'lt';
          let value: FieldValue = e.substring(e.indexOf(' ') + 1);
          return { field, operator, value, display: item.display || item.value };
        });

        if (filters.length === 2) {
          return { operator: 'and', filters, display: filters[0].display || filters[0].value, field } as LegacyFilter;
        }
        else if (filters.length === 1) {
          return { ...filters[0], field } as LegacyFilter;
        }
        throw new Error("Failed to parse distribution expression");
      }
    }

    if (typeof item.value === "string") {
      return { field, value: item.value, operator: "contains", display: item.display } as LegacyFilter;
    }
    return { field, value: item.value as string | number | boolean, display: item.display } as LegacyFilter;
  }

  private flattenFilters(filters: LegacyFilter[]) {
    let flattenedValues: string[] = [];

    function extractValues(filters: LegacyFilter[]) {
      for (const filter of filters) {
        if (filter.value) {
          flattenedValues.push(filter.value);

          if (filter.display)
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
}
