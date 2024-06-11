import { AppStore } from '@/app/stores';
import { Component, EventEmitter, Output, computed, inject, input, viewChild } from '@angular/core';
import { getState } from '@ngrx/signals';
import { Result } from '@sinequa/atomic';
import { IntlModule } from '@sinequa/core/intl';
import { DropdownComponent } from "../dropdown/dropdown";

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
  templateUrl: './sort-selector.component.html',
  styleUrl: './sort-selector.component.scss',
  imports: [IntlModule, DropdownComponent]
})
export class SortSelectorComponent {
  dropdown = viewChild(DropdownComponent);
  readonly result = input.required<Result>();

  @Output() readonly onSort = new EventEmitter<SortingChoice>();

  appStore = inject(AppStore);

  readonly queryName = computed(() => this.result()?.queryName);

  // fetch the sorting choices from the queries and process if choice is desc or asc
  readonly sortOptions = computed(() => {
    const { queries } = getState(this.appStore);
    if (queries === undefined) return [];

    const choices = queries?.[this.queryName()?.toLocaleLowerCase()]?.sortingChoices;

    // choices can be an empty string when nothing is defined in the configuration
    if (choices === undefined || (choices as unknown as string) === '') return [];

    return choices?.reduce((acc, sort) => {
      acc.push({ ...sort, $isDesc: sort.orderByClause.includes('desc') });
      return acc;
    }, [] as SortingChoice[]);
  });

  readonly sort = computed(() => this.sortOptions()?.find(x => x.name === this.result()?.sort));
  readonly isSortingDesc = computed(() => this.sort()?.orderByClause?.includes('desc'));

  onSortOptionClicked(sort: SortingChoice) {
    if (sort.name !== this.sort()?.name) {
      this.dropdown()?.close();
      this.onSort.emit(sort);
    }
  }
}
