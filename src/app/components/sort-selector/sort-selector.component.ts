import { appStore } from '@/app/stores';
import { Component, EventEmitter, Output, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Result } from '@sinequa/atomic';
import { filter, map } from 'rxjs';

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

  readonly queryName = computed(() => this.result()?.queryName);

  // fetch queries from the current app state when appStore is ready
  readonly queries = toSignal(appStore.current$.pipe(filter(x => !!x), map(x => x!.queries)));

  // fetch the sorting choices from the queries and process if choice is desc or asc
  readonly sortOptions = computed(() => {
    const choices = this.queries()?.[this.queryName()?.toLocaleLowerCase()]?.sortingChoices;
    return choices?.reduce((acc, sort) => {
      acc.push({ ...sort, $isDesc: sort.orderByClause.includes('desc') });
      return acc;
    }, [] as SortingChoice[]);
  });

  readonly sort = computed(() => this.sortOptions()?.find(x => x.name === this.result()?.sort));
  readonly isSortingDesc = computed(() => this.sort()?.orderByClause?.includes('desc'));
}
