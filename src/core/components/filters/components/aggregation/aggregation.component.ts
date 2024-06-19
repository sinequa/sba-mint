import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, Output, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';

import { Filter } from '@sinequa/atomic-angular';
import { QueryParamsStore } from '@sinequa/atomic-angular';
import { AggregationListEx, AggregationListItem, AggregationTreeEx, AggregationsService } from '@sinequa/atomic-angular';
import { buildQuery } from '@sinequa/atomic-angular';

import { AggregationRowComponent } from "./components/aggregation-row.component";

export type AggregationTitle = {
  label: string;
  icon?: string;
};

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
  imports: [AsyncPipe, ReactiveFormsModule, NgClass, NgIf, AggregationRowComponent]
})
export class AggregationComponent implements OnInit {
  @Output() public readonly onLoadMore = new EventEmitter<void>();

  /**
   * Event emitter for changes in filters.
   * Emits a `Filter` object when the filters change (**apply** or **clear** actions).
   */
  @Output() public readonly onFiltersChanges = new EventEmitter<Filter>();
  @Output() public readonly onSelect = new EventEmitter<Filter>();

  private queryParamsStore = inject(QueryParamsStore);

  protected readonly hasFilter = signal<boolean>(false);

  title = input<AggregationTitle>();
  aggregation = input.required<AggregationListEx | AggregationTreeEx>();

  items = computed(() => this.aggregation().items || []);

  selected = computed<AggregationListItem[]>(() => {
    return this.items().sort((a, b) => b.$selected && !a.$selected ? 1 : -1)
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
    const filters = this.getSelectedFilters()

    this.hasFilter.set(Boolean(filters.length));
    this.onSelect.emit({ column: this.aggregation().column, label: item.value?.toString() || '', values: filters });
  }

  public apply(): void {
    const filters = this.getSelectedFilters();

    this.onFiltersChanges.emit({ column: this.aggregation().column, label: filters[0], values: filters });
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

    if (notifyAsUpdated) this.onFiltersChanges.emit({ column: this.aggregation().column, label: undefined, values: [] });
  }

  private hasFilters(): boolean {
    if (this.aggregation().isTree) {
      // TODO: implement
      return false;
    }
    return !!(this.aggregation().items?.some(item => item.$selected));
  }

  private getSelectedFilters(): string[] {
    let filters: string[] = [];
    if (!this.aggregation().isTree) {
      filters = this.aggregation().items
        .filter(item => item.$selected)
        .map((item) => item.value?.toString() || '');
    }

    if (this.aggregation().isTree) {
      filters = this.getFlattenTreeItems()
        .filter(item => item.$selected)
        .map((item) => `/${item.$path}/*` || '');
    }

    return filters;
  }

  private getFlattenTreeItems(): TreeAggregationNode[] {
    if(this.aggregation().items === undefined) return [];

    const flattenItems = (items: TreeAggregationNode[]): TreeAggregationNode[] => {
      return items.reduce((flat, item) => {
        return flat.concat(item, item.items ? flattenItems(item.items) : []);
      }, [] as TreeAggregationNode[]);
    };

    return flattenItems(this.aggregation().items as TreeAggregationNode[]);
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
