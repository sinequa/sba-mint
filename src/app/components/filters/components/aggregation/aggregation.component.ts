import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Injector, OnInit, Output, inject, input, runInInjectionContext, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AggregationEx, AggregationListItem, AggregationTreeEx, AggregationsService } from '@/app/services';
import { buildQuery } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { TreeAggregation, TreeAggregationNode } from '@sinequa/atomic';
import { AggregationRowComponent } from "./components/aggregation-row.component";



export type AggregationTitle = {
  label: string;
  iconClass?: string;
};

@Component({
  selector: 'app-aggregation',
  standalone: true,
  templateUrl: './aggregation.component.html',
  styles: [`:host { display: block; }`],
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

  protected readonly hasFilter = signal<boolean>(false);

  title = input<AggregationTitle>();
  aggregation = input.required<AggregationEx | AggregationTreeEx>();

  aggregationsService = inject(AggregationsService);

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.hasFilter.set(this.hasFilters());
  }

  public select(item: AggregationListItem): void {
    const filters = this.getFilters()

    this.hasFilter.set(Boolean(filters.length));
    this.onSelect.emit({ column: this.aggregation().column, label: item.value?.toString() || '', values: filters });
  }

  public apply(): void {
    const filters = this.getFilters();

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

  private getFilters(): string[] {
    let filters: string[] = [];
    if (!this.aggregation().isTree) {
      filters = this.aggregation().items
        .filter(item => item.$selected)
        .map((item) => item.value?.toString() || '');
    }

    if (this.aggregation().isTree) {
      filters = this.getFlattenTreeItems()
        .filter(item => item.$selected)
        .map((item) => item.$path || '');
    }

    return filters;
  }

  private getFlattenTreeItems(): TreeAggregationNode[] {
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
