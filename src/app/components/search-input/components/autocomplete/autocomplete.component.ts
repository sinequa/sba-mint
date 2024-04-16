import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, filter, map, switchMap } from 'rxjs';

import { Suggestion as SuggestionBasic } from '@sinequa/atomic';

import { HighlightWordPipe } from "@/app/pipes/highlight-word.pipe";
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { AppStore } from '@/app/stores';

export type Suggestion = Partial<SuggestionBasic> & {
  $isDivider: boolean;
}

const titledSections = ['title', 'concepts', 'people', 'bookmark'];
const autocompleteCategories = ['full-text', 'recent-search', 'saved-search',  'bookmark', 'title', 'concepts', 'people'];


@Component({
    selector: 'app-autocomplete',
    standalone: true,
    templateUrl: './autocomplete.component.html',
    imports: [AsyncPipe, NgIf, NgClass, HighlightWordPipe]
})
export class AutocompleteComponent {
  readonly text = input<string>('');

  @Output() readonly onClick = new EventEmitter<Suggestion>();

  readonly autocompleteService = inject(AutocompleteService);
  readonly appStore = inject(AppStore);

  readonly items$ = toObservable(this.text).pipe(
    filter(text => !!text),
    map(text => ({ text, autocomplete: this.appStore.customizationJson()?.autocomplete })),
    switchMap(({ text, autocomplete }) => combineLatest([
      this.autocompleteService.getFromUserSettingsForText(text, autocomplete ?? 5),
      this.autocompleteService.getFromSuggestQueriesForText(text)
    ])),
    map(items => items.flat(2)),
    // order the items to have full-text, recent search and saved search at the beginning
    map(items => items.sort((a, b) => {
      return autocompleteCategories.indexOf(a.category) - autocompleteCategories.indexOf(b.category);
    })),
    map((items) => items.reduce<Suggestion[]>((acc, curr) => {
      if (acc.length > 0) {
        const last = acc.at(-1);

        // add a divider before specific categories
        if (!last?.$isDivider && last?.category !== curr.category && titledSections.includes(curr.category)) {
          acc.push({ $isDivider: true });
            acc.push({category: curr.category, $isDivider: false});
        }
        // handle the case when the first item is from a titled section
      } else if (titledSections.includes(curr.category)) {
        acc.push({category: curr.category, $isDivider: false});
      }

      acc.push({ ...curr, $isDivider: false });

      return acc;
    }, []))
  );

  public itemClicked(item: Suggestion): void {
    this.onClick.emit(item);
  }
}
