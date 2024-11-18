import { ChangeDetectorRef, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { Aggregation, AggregationItem, fetchDataset, fetchSuggestField, FieldValue, LegacyFilter, Query, Suggestion, suggestionsToTreeAggregationNodes, TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationListItem, AggregationsService, AggregationsStore, AppStore, buildQuery, CFilter, CFilterItem, debouncedSignal, QueryParamsStore, SearchService } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';

import { AggregationRowComponent } from "./aggregation-row.component";


export type AggEx = Aggregation & {
  display?: string;
  icon?: string;
  hidden?: boolean;
}

export type AggregationTitle = {
  label: string;
  icon?: string;
};

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
  imports: [FormsModule, ReactiveFormsModule, AggregationRowComponent, SyslangPipe, TranslocoPipe],
})
export class AggregationComponent {
  cdr = inject(ChangeDetectorRef);
  /* stores */
  aggregationsStore = inject(AggregationsStore);
  appStore = inject(AppStore);
  queryParamsStore = inject(QueryParamsStore);
  searchService = inject(SearchService);

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
    if (this.name() !== null) {
      return this.processAggregation();
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

    // if the aggregation is a tree, we transform the suggestions into tree nodes
    if(this.aggregation()?.isTree) {
      return suggestionsToTreeAggregationNodes(this.suggests()!, this.debouncedSearchText());
    }

    // if the aggregation is not a tree, we return the suggestions as is
    return this.suggests()!.map(suggest => ({
      name: suggest.category,
      value: suggest.normalized || suggest.display || '',
      display: suggest.display,
      column: suggest.id,
      count: 1,
      $selected: false,
      items: []
    }));

  });

  query: Query;

  constructor() {
    this.query = buildQuery();

    const q = this.queryParamsStore.getQuery();

    effect(async () => {
      if (this.debouncedSearchText() === '' || this.aggregation() === null) {
        this.suggests.set(undefined);
        return;
      }

      const suggests = await fetchSuggestField(this.debouncedSearchText(), [this.aggregation()!.column]);
      this.suggests.set(suggests);
    }, { allowSignalWrites: true });

    effect(() => {
      if (this.aggregation() === null) return;

      const count = this.countSelected(this.aggregation()!.items as AggregationListItem[]);
      this.selectionCount.set(count);
    }, { allowSignalWrites: true });
  }

  protected processAggregation(): AggEx | null | undefined {
    const agg: AggEx = this.aggregationsStore.getAggregation(this.name() || '', this.kind()) as AggEx;

    if(!agg) return null;

    const { items = [], display = agg.name, icon, hidden } = this.appStore.getAggregationCustomization(agg.column) as CFilter || {};
    agg.display = display;
    agg.icon = icon;
    agg.hidden = hidden;

    if (agg.items) {
      const { filters = [] } = getState(this.queryParamsStore);
      const flattenedValues = this.flattenFilters(filters);

      (agg.items as AggregationListItem[]).forEach((item: AggregationListItem) => {

        if (agg.isTree) {
          this.selectItems(agg.items as AggregationListItem[], flattenedValues);
        } else {
          const valueToSearch = agg.valuesAreExpressions ? item.display : item.value;
          item.$selected = flattenedValues.includes(valueToSearch ?? '') || false;
        }

        item.icon = items?.find((it: CFilterItem) => it.value === item.value)?.icon;
      });
    }

    return agg;
  }

  /**
 * Clears the current filter for the aggregation column.
 *
 * This method updates the filter in the `queryParamsStore` by setting the display value
 * of the current aggregation column to an empty string.
 */
  clear() {
    this.queryParamsStore.removeFilter(this.aggregation()?.column);
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
        this.queryParamsStore.updateFilter({ operator: 'or', filters, name: this.aggregation()?.name, field: this.aggregation()?.column, display } as LegacyFilter);
      }
      else {
        const values = filters.map(filter => filter.value);
        this.queryParamsStore.updateFilter({ operator: 'in', name: this.aggregation()?.name, field: this.aggregation()?.column, values, display, filters } as LegacyFilter);
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

  async open(node: AggregationListItem) {
    const q = this.queryParamsStore.getQuery();
    await firstValueFrom(this.aggregationsService.open(q, this.aggregation() as TreeAggregation, node as TreeAggregationNode));
    this.cdr.detectChanges();
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
    const name = this.aggregation()?.name;
    const items = this.getFlattenTreeItems()
      .filter(item => item.$selected)
      .map((item) => `/${item.$path}/*` || '');

    if (items.length === 0) return [];

    const filter = { operator: "in", name, field, values: items, display: items[0] };
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
    const searchItems = this.searchedItems()?.filter(item => item.$selected) || [];
    const items = this.items().filter(item => item.$selected) || [];
    const selectedItems = [...searchItems, ...items];

    return selectedItems.map(item => this.toFilter(item));
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

    const searchItems = flattenItems(this.searchedItems() || []);
    const items = flattenItems(this.aggregation()?.items as TreeAggregationNode[] || []);
    const flattenedTreeItems = [...searchItems, ...items];
    return flattenedTreeItems;
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
    const name = this.aggregation()?.name;

    if (this.aggregation()?.isDistribution) {
      const res = (item.value as string).match(/.*\:\(?([><=\d\-\.AND ]+)\)?/);
      if (res?.[1]) {
        const expr = res?.[1].split(" AND ");
        const filters = expr.map(e => {
          const operator: 'gte' | 'lt' = e.indexOf('>=') !== -1 ? 'gte' : 'lt';
          let value: FieldValue = e.substring(e.indexOf(' ') + 1);
          return { name, field, operator, value, display: item.display || item.value };
        });

        if (filters.length === 2) {
          return { operator: 'and', filters, display: filters[0].display || filters[0].value, field, name } as LegacyFilter;
        }
        else if (filters.length === 1) {
          return { ...filters[0], field, name } as LegacyFilter;
        }
        throw new Error("Failed to parse distribution expression");
      }
    }

    if (typeof item.value === "string") {
      return { name, field, value: item.value, operator: "contains", display: item.display } as LegacyFilter;
    }
    return { name, field, value: item.value as string | number | boolean, display: item.display } as LegacyFilter;
  }

  private flattenFilters(filters: LegacyFilter[]) {
    let flattenedValues: string[] = [];

    function extractValues(filters: LegacyFilter[]) {
      for (const filter of filters) {
        if (filter.value) {
          flattenedValues.push(filter.value);

          if (filter.display)
            flattenedValues.push(filter.display);
          // we handle "values" field for trees
        } else if (filter.values) {
          flattenedValues.push(...filter.values);
        }
        if (filter.filters) {
          extractValues(filter.filters as LegacyFilter[]);
        }
      }
    }

    extractValues(filters);
    return flattenedValues;
  }

  // Select all items for tree aggregation
  // If an item is selected, open all its parents
  private selectItems(items: AggregationListItem[], values: string[]): boolean {
    let shouldParentBeOpened = false;

    items.forEach(item => {
      if (values.includes(`/${item.$path}/*`)) {
        item.$selected = true;
        shouldParentBeOpened = true;
      }
      if (item.items) {
        const shouldBeOpened = this.selectItems(item.items, values);
        item.$opened = shouldBeOpened;
        shouldParentBeOpened = shouldParentBeOpened || shouldBeOpened;
      }
    });

    return shouldParentBeOpened;
  }

    /**
   * Counts the number of selected items in a nested list of `AggregationListItem`.
   *
   * This method recursively traverses the provided list of items and their nested items,
   * counting how many of them have the `$selected` property set to `true`.
   *
   * @param items - The list of `AggregationListItem` to count selected items from.
   * @returns The total number of selected items.
   */
    protected countSelected(items: AggregationListItem[]): number {
      if(!items) return 0;

      return items.reduce((count, item) => {
        if (item.$selected) count++;
        if (item.items) count += this.countSelected(item.items);
        return count;
      }, 0);
    }
}
