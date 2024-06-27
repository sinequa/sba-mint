import { Component, computed, inject, input, output, viewChild } from '@angular/core';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';

import { CCApp, Result } from '@sinequa/atomic';
import { AppStore } from '@sinequa/atomic-angular';

import { DropdownComponent } from '@/core/components/dropdown';

export type SortingChoice = {
  name: string;
  description: string;
  display: string;
  orderByClause: string;
  isDefaultNoRelevance: boolean;
  isDefaultWithRelevance: boolean;
  $isDesc?: boolean;
}

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-sort-selector',
  standalone: true,
  templateUrl: './sort-selector.component.html',
  styleUrl: './sort-selector.component.scss',
  imports: [DropdownComponent, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'sort-selector', loader })]
})
export class SortSelectorComponent {
  readonly result = input.required<Result>();
  readonly onSort = output<SortingChoice>();
  
  dropdown = viewChild(DropdownComponent);
  appStore = inject(AppStore);

  readonly queryName = computed(() => this.result()?.queryName);

  // fetch the sorting choices from the queries and process if choice is desc or asc
  readonly sortOptions = computed(() => {
    const { queries } = getState(this.appStore) as CCApp;
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
