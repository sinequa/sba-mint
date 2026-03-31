import { Component, computed, inject, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Result } from '@sinequa/atomic';
import {
  DidYouMeanComponent,
  QueryParamsStore,
  QueryService,
  SelectionStore,
  SortSelectorComponent,
  SortingChoice,
  SponsoredResultsComponent
} from '@sinequa/atomic-angular';
import { ButtonComponent, Square, SquareCheckBigIcon, SquareMinusIcon } from '@sinequa/ui';

@Component({
  selector: 'app-search-actions',
  imports: [TranslocoPipe, ButtonComponent, DidYouMeanComponent, SponsoredResultsComponent, SquareCheckBigIcon, SquareMinusIcon, Square, SortSelectorComponent],
  template: `
    <!-- did you mean and sponsored links -->
    <div class="px-3">
      <DidYouMean class="text-alert py-1 empty:hidden" [result]="result()" />
      <sponsored-results />
    </div>

    <!-- sort selector and export button -->
    @if (hasRowCount()) {
      <div class="@container flex gap-1 has-[+ul>li.no-records]:hidden">
        <button variant="ghost" (click)="selectAll.emit()">
          @switch (selectedAll()) {
            @case ('all') {
              <SquareCheckBig />
              <span class="truncate">{{ 'searches.selection.unselectAll' | transloco }}</span>
            }
            @case ('some') {
              <SquareMinus />
              <span class="truncate">{{ 'searches.selection.selectAll' | transloco }}</span>
            }
            @default {
              <Square />
              <span class="truncate">{{ 'searches.selection.selectAll' | transloco }}</span>
            }
          }
        </button>
        <sort-selector class="ms-auto" [result]="result()!" position="bottom-start" (onSort)="onSort($event)" />
      </div>
    }
  `
})
export class SearchActionsComponent {
  protected readonly queryService = inject(QueryService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly selectionStore = inject(SelectionStore);

  selectAll = output();
  selectedAll = input.required<'all' | 'some' | 'none'>();

  result = input.required<Result | undefined>();
  hasRowCount = computed(() => (this.result()?.rowCount || 0) > 0);

  onSort(sort: SortingChoice): void {
    const audit = {
      type: 'Search_Sort',
      detail: {
        sort: sort.name,
        orderByClause: sort.orderByClause
      }
    };
    this.queryService.audit = audit;
    this.queryParamsStore.patch({ sort: sort.name }, audit);
  }
}
