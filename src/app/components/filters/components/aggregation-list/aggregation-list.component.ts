import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';


import { input } from '@angular/core';

import { AggregationEx, AggregationListItem } from '@/app/services';
import { Filter } from '@/app/utils/models';



export type AggregationListTitle = {
  label: string;
  iconClass?: string;
};

@Component({
  selector: 'app-aggregation-list-filter',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './aggregation-list.component.html',
  styles: [`:host { display: block; }`]
})
export class AggregationListFilterComponent implements OnInit {
  @Output() public readonly onLoadMore = new EventEmitter<void>();

  /**
   * Event emitter for changes in filters.
   * Emits a `Filter` object when the filters change (**apply** or **clear** actions).
   */
  @Output() public readonly onFiltersChanges = new EventEmitter<Filter>();
  @Output() public readonly onSelect = new EventEmitter<Filter>();

  protected readonly hasFilter = signal<boolean>(false);

  title = input<AggregationListTitle>();
  aggregation = input.required<AggregationEx>();

  ngOnInit(): void {
    this.hasFilter.set(this.hasFilters());
  }

  public select(event: Event, item: AggregationListItem): void {
    item.$selected = !item.$selected;

    const filters = this.aggregation().items
      .filter(item => item.$selected)
      .map((item) => item.value?.toString() || '');

    this.hasFilter.set(Boolean(filters.length));
    this.onSelect.emit({ column: this.aggregation().column, label: item.value?.toString() || '', values: filters });
  }

  public apply(): void {
    const filters = this.aggregation().items
      .filter(item => item.$selected)
      .map((item) => item.value?.toString() || '');

    this.onFiltersChanges.emit({ column: this.aggregation().column, label: filters[0], values: filters });
  }

  public clearFilters(notifyAsUpdated: boolean = true): void {
    if (this.aggregation().items) {
      this.aggregation().items.forEach(item => item.$selected = false);
      this.hasFilter.set(this.hasFilters());
    }

    if (notifyAsUpdated) this.onFiltersChanges.emit({ column: this.aggregation().column, label: undefined, values: [] });
  }

  private hasFilters(): boolean {
    return this.aggregation().items.some(item => item.$selected);
  }


  loadMore(): void {
    this.onLoadMore.emit();
  }
}
