import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, Output, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import { AggregationItem, LegacyFilter, TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationListEx, AggregationListItem, AggregationTreeEx, AggregationsService, QueryParamsStore, buildQuery } from '@sinequa/atomic-angular';

import { SyslangPipe } from '@/core/pipe/syslang';

import { AggregationRowComponent } from "./aggregation-row/aggregation-row.component";

type FieldValue = string | number | Date | boolean | Array<string | { value: string, display?: string }>;

export type AggregationTitle = {
  label: string;
  icon?: string;
};

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>);

@Component({
  selector: 'app-aggregation',
  standalone: true,
  templateUrl: './aggregation.component.html',
  styles: [`
    :host {
      display: block;
    }

    fieldset {
      scrollbar-width: thin;
    }
  `],
  imports: [AsyncPipe, ReactiveFormsModule, NgClass, NgIf, AggregationRowComponent, SyslangPipe, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'filters', loader })]
})
export class AggregationComponent implements OnInit {
  @Output() public readonly onLoadMore = new EventEmitter<void>();

  /**
   * Event emitter for changes in filters.
   * Emits a `Filter` object when the filters change (**apply** or **clear** actions).
   */
  @Output() public readonly onFiltersChanges = new EventEmitter<LegacyFilter>();
  @Output() public readonly onSelect = new EventEmitter<LegacyFilter>();

  private queryParamsStore = inject(QueryParamsStore);

  protected readonly hasFilter = signal<boolean>(false);

  title = input<AggregationTitle>();
  aggregation = input.required<AggregationListEx | AggregationTreeEx>();

  items = computed(() => this.aggregation().items || []);

  selected = computed<AggregationListItem[]>(() => {
    // $selected elements must be displayed first, but the other elements must stay in the same order
    const selected = this.items().filter(item => item.$selected);

    // const columnFilter = this.queryParamsStore.getFilterFromColumn(this.aggregation().column);
    // if (columnFilter?.filters) {
    //   const selectedFilters = columnFilter.filters.map((filter: LegacyFilter) => {
    //     return ({ count: 1, value: filter.value, display: filter.display, $selected: true }) as AggregationListItem;
    //   }).filter((item) => !selected.some(selectedItem => selectedItem.value === item.value));
    //   selected.push(...selectedFilters);
    // }
    // if (columnFilter?.value) {
    //   const selectedFilters = ({ count: 1, value: columnFilter.value, display: columnFilter.display, $selected: true }) as AggregationListItem;
    //   if (!selected.some(selectedItem => selectedItem.value === columnFilter.value)) {
    //     selected.push(selectedFilters);
    //   };
    // }

    // remove from notSelected the elements that are already in selected (due to a load more action for example)
    const notSelected = this.items().filter(item => !item.$selected).filter((item) => !selected.some(selectedItem => selectedItem.value === item.value));

    return selected.concat(notSelected) as AggregationListItem[];
  });

  readonly aggregationsService = inject(AggregationsService);
  readonly injector = inject(Injector);

  hasAppliedFilters = computed(() => {
    return !!this.queryParamsStore.getFilterFromColumn(this.aggregation().column);
  });

  ngOnInit(): void {
    this.hasFilter.set(this.hasFilters());
  }

  public select(item: AggregationListItem): void {
    const filters = this.getFilters();

    this.hasFilter.set(Boolean(filters.length));

    // if filters length > 1, we need to wrap them in an "or" filter
    if (filters.length > 1) {
      const display = filters[0].display;
      this.onSelect.emit({ operator: 'or', filters, field: this.aggregation().column, display } as LegacyFilter);
    } else {
      this.onSelect.emit(filters[0]);
    }
  }

  public apply(): void {
    const filters = this.getFilters();

    // if filters length > 1, we need to wrap them in an "or" filter
    if (filters.length > 1) {
      const display = filters[0].display;
      // if aggregation not a distribution, we need to merge the filters into a single filter with an in operator
      // with the values of the filters
      if (this.aggregation().isDistribution) {
        this.onFiltersChanges.emit({ operator: 'or', filters, field: this.aggregation().column, display } as LegacyFilter);
      }
      else {
        const values = filters.map(filter => filter.value);
        this.onFiltersChanges.emit({ operator: 'in', field: this.aggregation().column, values, display, filters } as LegacyFilter);
      }
    }
    else {
      this.onFiltersChanges.emit(filters[0]);
    }
  }

  public clearFilters(notifyAsUpdated: boolean = true): void {
    // sets the $selected flag from all items to false
    if (this.aggregation().isTree === false) {
      if (this.aggregation().items) {
        this.aggregation().items.forEach(item => item.$selected = false);
        this.hasFilter.set(this.hasFilters());
      }
    }

    // recursively sets the $selected flag from all items to false
    if (this.aggregation().isTree) {
      const allItems = this.getFlattenTreeItems();
      allItems.forEach(item => item.$selected = false);
    }

    if (notifyAsUpdated) this.onFiltersChanges.emit({ field: this.aggregation().column, display: '' } as LegacyFilter);
  }

  private hasFilters(): boolean {
    if (this.aggregation().isTree) {
      const allItems = this.getFlattenTreeItems();
      return !!allItems.some(item => item.$selected);
    }
    return !!(this.selected().some(item => item.$selected));
  }

  private getFlattenTreeItems(): TreeAggregationNode[] {
    if (this.aggregation().items === undefined) return [];

    const flattenItems = (items: TreeAggregationNode[]): TreeAggregationNode[] => {
      return items.reduce((flat, item) => {
        return flat.concat(item, item.items ? flattenItems(item.items) : []);
      }, [] as TreeAggregationNode[]);
    };

    return flattenItems(this.aggregation().items as TreeAggregationNode[]);
  }

  protected getFilters() {
    if (this.aggregation().isTree) return this.getFiltersForTree();
    return this.getFiltersForList();
  }

  protected getFiltersForTree(): LegacyFilter[] {
    const items = this.aggregation().items || [];
    const filters = items.map(item => this.toFilter(item));
    return filters;
  }
  protected getFiltersForList(): LegacyFilter[] {
    const items = this.aggregation().items.filter(item => item.$selected) || [];
    const filters = items.map(item => this.toFilter(item));
    return filters;
  }

  protected toFilter(item: AggregationItem): LegacyFilter {
    const field = this.aggregation().column;

    if (this.aggregation().isTree) {
      // const _item = item as TreeAggregationNode;
      // return {field, value: '/' +_item.$path! + '/*', display: _item.value}
      const items = this.getFlattenTreeItems()
        .filter(item => item.$selected)
        .map((item) => `/${item.$path}/*` || '');

      return { operator: "in", field, values: items, display: items[0] };
    }

    if (this.aggregation().isDistribution) {
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

  loadMore(): void {
    this.onLoadMore.emit();
  }

  open(node: AggregationListItem) {
    // aggregation is updated in the service, so we need to pass it to the open method
    // and the ui will be updated with the new aggregation automatically
    const q = runInInjectionContext(this.injector, () => buildQuery())
    this.aggregationsService.open(q, this.aggregation() as TreeAggregation, node as TreeAggregationNode).subscribe();
  }
}
