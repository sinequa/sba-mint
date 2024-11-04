import { Component, computed, inject, input, OnDestroy, signal } from '@angular/core';
import { getState } from '@ngrx/signals';

import { Aggregation, AggregationItem, aggregationItemStrictCompare, bisect, FieldValue, LegacyFilter } from '@sinequa/atomic';
import { AggregationListItem, AggregationsService, AggregationsStore, AppStore, CFilter, CFilterItem, QueryParamsStore } from '@sinequa/atomic-angular';


import { firstValueFrom, Subscription } from 'rxjs';


export type AggEx = Aggregation & {
  display?: string;
  icon?: string;
  hidden?: boolean;
}

@Component({
  template: '',
})
export abstract class AggregationBase {
  /* stores */
  readonly aggregationsStore = inject(AggregationsStore);
  readonly appStore = inject(AppStore);
  readonly queryParamsStore = inject(QueryParamsStore);
  /* services */
  readonly aggregationsService = inject(AggregationsService);
  /**
   * The `name` property is a required input that can be either a string or null.
   * By default, it represents the name of the aggregation column.
   *
   * If you want specify a column name, uses the `kind` input with the `'column'` value.
   *
   * @remarks
   * The `kind` property is an input that can be either "column" or "name".
   */
  readonly name = input.required<string | null>();
  /**
   * Represents the type of aggregation component.
   *
   * Default is "name"
   */
  readonly kind = input<"column" | "name">("name");
  /**
   * Is the aggregation component loading more items?
   */
  readonly loadingMore = signal<boolean>(false);

  /** Aggregation computed from stores and selected by `name()` and `kind()` */
  readonly aggregation = computed(() => {
    if (!this.name()) return;

    return this.processAggregation();
  })

  /**
   * Processes the aggregation by retrieving it from the store and updating its display, icon, and hidden properties.
   * Apply the selected state to the items based on the current filters.
   *
   * @returns - The processed aggregation or null if the aggregation is not found.
   */
  protected processAggregation(): AggEx | null | undefined {
    const agg: AggEx = this.aggregationsStore.getAggregation(this.name() || '', this.kind()) as AggEx;

    if (!agg)
      throw new Error(`Aggregation ${this.name()} not found`);

    const { items = [], display = agg.name, icon, hidden } = this.appStore.getAggregationCustomization(agg.column) as CFilter || {};

    agg.display = display;
    agg.icon = icon;
    agg.hidden = hidden;

    // process known items
    if (agg.items) {
      // remove cached items if there was a loadMore
      agg.items = agg.items.filter((i: AggregationItem) => !(i as any).$cached);

      const { filters = [] } = getState(this.queryParamsStore);
      const flattenedValues = this.flattenFilters(filters);

      (agg.items as AggregationListItem[]).forEach((item: AggregationListItem) => {
        if (agg.isTree) {
          const { values = [] } = this.queryParamsStore.getFilterFromColumn(agg.column) as LegacyFilter || {};
          this.selectItems(agg.items as AggregationListItem[], values);
        } else {
          const valueToSearch = agg.valuesAreExpressions ? item.display : item.value;
          item.$selected = flattenedValues.includes(valueToSearch ?? '') || false;
        }

        item.icon = items?.find((it: CFilterItem) => it.value === item.value)?.icon;
      });
    } else {
      agg.items = [];
    }

    // add cached items on top of the list for non-tree aggregations
    if (!agg.isTree) {
      let currentAggregationFilters = getState(this.queryParamsStore).filters?.filter(f => f.field === agg.column);

      currentAggregationFilters = currentAggregationFilters?.reduce((acc, f) => {
        if (f.operator === 'in')
          acc.push(...(f as any)?.$filters);
        else
          acc.push(f);

        return acc;
      }, [] as LegacyFilter[]);

      if (currentAggregationFilters && currentAggregationFilters.length > 0) {
        const sections = bisect(
          agg.items,
          (i) => currentAggregationFilters.find(
            f => aggregationItemStrictCompare(agg, f as any as AggregationItem, i)
          ) !== undefined);

        if (currentAggregationFilters.length > sections.true.length) {
          const toAdd = currentAggregationFilters.filter(f => !sections.true.find(i => aggregationItemStrictCompare(agg, f as any as AggregationItem, i)));
          agg.items.unshift(...(toAdd.map(f => ({ value: f.value, display: f.display, $selected: true, $cached: true } as any as AggregationItem))));
        }
      }
    }

    return (agg?.items) ? agg : null;
  }

  /** Load next page of filter */
  protected async loadMore(): Promise<void> {
    const q = this.queryParamsStore.getQuery();

    this.loadingMore.set(true);
    const aggregation = await firstValueFrom(this.aggregationsService.loadMore(q, this.aggregation() as Aggregation));
    this.aggregationsStore.updateAggregation(aggregation);
    this.loadingMore.set(false);
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
  protected toFilter(item: AggregationItem): LegacyFilter {
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

  /**
   * Flattens the filters to extract the values and displays.
   * @param filters - The filters to be flattened.
   * @returns An array of strings containing the values and displays of the filters.
   */
  protected flattenFilters(filters: LegacyFilter[]) {
    let flattenedValues: string[] = [];

    function extractValues(filters: LegacyFilter[]) {
      for (const filter of filters) {
        // appended display value
        if (filter.display)
          flattenedValues.push(filter.display);

        // filter.value and filter.values should be exclusive
        if (filter.value)
          flattenedValues.push(filter.value);
        else if (filter.values)
          flattenedValues.push(...filter.values);

        // dig deeper
        if (filter.filters)
          extractValues(filter.filters as LegacyFilter[]);
      }
    }

    extractValues(filters);
    return flattenedValues;
  }

  // Select all items for tree aggregation
  /**
   * Selects items from the provided list based on the given values.
   *
   * This method iterates through the `items` array and sets the `$selected` property
   * of each item to `true` if its `$path` matches any of the values in the `values` array.
   * If an item contains nested items, the method recursively selects items within those nested lists.
   *
   * @param items - The list of `AggregationListItem` objects to be processed.
   * @param values - An array of string values used to determine which items should be selected.
   */
  protected selectItems(items: AggregationListItem[], values: string[]) {
    items.forEach(item => {
      if (values.includes(`/${item.$path}/*`)) {
        item.$selected = true;
      }
      if (item.items) {
        this.selectItems(item.items, values);
      }
    });
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
    return items.reduce((count, item) => {
      if (item.$selected) count++;
      if (item.items) count += this.countSelected(item.items);
      return count;
    }, 0);
  }
}
