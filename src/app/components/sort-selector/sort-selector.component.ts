import { AppStore } from '@/app/stores';
import { Component, EventEmitter, Output, computed, inject, input } from '@angular/core';
import { getState } from '@ngrx/signals';
import { Result } from '@sinequa/atomic';

export type SortingChoice = {
  name: string;
  description: string;
  display: string;
  orderByClause: string;
  isDefaultNoRelevance: boolean;
  isDefaultWithRelevance: boolean;
  $isDesc?: boolean;
}

@Component({
  selector: 'app-sort-selector',
  standalone: true,
  imports: [],
  templateUrl: './sort-selector.component.html',
  styleUrl: './sort-selector.component.scss'
})
export class SortSelectorComponent {
  readonly result = input.required<Result>();

  @Output() readonly onSort = new EventEmitter<SortingChoice>();

  appSore = inject(AppStore);

  readonly queryName = computed(() => this.result()?.queryName);

  // fetch the sorting choices from the queries and process if choice is desc or asc
  readonly sortOptions = computed(() => {
    const{queries} = getState(this.appSore);
    if(queries === undefined) return [];

    const choices = queries?.[this.queryName()?.toLocaleLowerCase()]?.sortingChoices;
    if(choices === undefined) return [];
    return choices?.reduce((acc, sort) => {
      acc.push({ ...sort, $isDesc: sort.orderByClause.includes('desc') });
      return acc;
    }, [] as SortingChoice[]);
  });

  readonly sort = computed(() => this.sortOptions()?.find(x => x.name === this.result()?.sort));
  readonly isSortingDesc = computed(() => this.sort()?.orderByClause?.includes('desc'));

  onSortOptionClicked(sort: SortingChoice) {
    if (sort.name !== this.sort()?.name) this.onSort.emit(sort);
  }
}
