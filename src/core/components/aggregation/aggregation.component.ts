import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { AggregationListItem, debouncedSignal } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipes/syslang';

import { Aggregation, fetchSuggestField, LegacyFilter, Suggestion, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationRowComponent } from "./aggregation-row.component";
import { BaseAggregation } from './base-aggregation.abstract';


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
export class AggregationComponent extends BaseAggregation {
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

  /* items of the aggregations */
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
    super();

    effect(async () => {
      if (this.debouncedSearchText() === '') {
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
      if (this.aggregation()?.isDistribution)
        this.queryParamsStore.updateFilter({ operator: 'or', filters, field: this.aggregation()?.column, display } as LegacyFilter);
      else {
        const values = filters.map(filter => filter.value);
        this.queryParamsStore.updateFilter({ operator: 'in', field: this.aggregation()?.column, values, display, $filters: filters } as LegacyFilter);
      }
    }
    else if (filters.length === 1)
      this.queryParamsStore.updateFilter(filters[0]);
    else
      this.clear();

    this.searchText.set('');
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
  protected getFlattenTreeItems(): TreeAggregationNode[] {
    const flattenItems = (items: TreeAggregationNode[]): TreeAggregationNode[] => {
      return items.reduce((flat, item) => {
        return flat.concat(item, item.items ? flattenItems(item.items) : []);
      }, [] as TreeAggregationNode[]);
    };

    return flattenItems(this.items());
  }
}
