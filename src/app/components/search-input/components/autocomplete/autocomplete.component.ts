import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, inject, input } from '@angular/core';
import { combineLatest, map, switchMap } from 'rxjs';

import { Suggestion as SuggestionBasic } from '@sinequa/atomic';

import { HighlightWordPipe } from "@/app/pipes/highlight-word.pipe";
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { AppStore, UserSettingsStore } from '@/app/stores';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

export type Suggestion = Partial<SuggestionBasic> & {
  $isDivider: boolean;
}

@Component({
    selector: 'app-autocomplete',
    standalone: true,
    templateUrl: './autocomplete.component.html',
    imports: [AsyncPipe, NgIf, NgClass, HighlightWordPipe]
})
export class AutocompleteComponent {
  readonly text = input<string>('');
  readonly wasSearchClicked = input<boolean>(false);

  @Output() readonly onClick = new EventEmitter<Suggestion>();

  readonly autocompleteService = inject(AutocompleteService);
  readonly appStore = inject(AppStore);

  private wasSearchClicked$ = toObservable(this.wasSearchClicked);

  private text$ = toObservable(this.text);

  uss = inject(UserSettingsStore);

  readonly items = toSignal(
    combineLatest([this.text$, this.wasSearchClicked$])
      .pipe(
        switchMap(([testText]) => {
          const autocomplete = this.appStore.customizationJson()?.autocomplete;

          if (!testText) {
            return this.autocompleteService.getFromUserSettingsForText(testText, autocomplete ?? 5);
          }

          return combineLatest([
            this.autocompleteService.getFromUserSettingsForText(testText, autocomplete ?? 5),
            this.autocompleteService.getFromSuggestQueriesForText(testText)
          ]);
        }),
        map(items => items.flat(2)),
        map((items) => items.reduce<Suggestion[]>((acc, curr) => {
          if (acc.length > 0) {
            const last = acc.at(-1);

            if (!last?.$isDivider && last?.category !== curr.category)
              acc.push({ $isDivider: true });
          }

          acc.push({ ...curr, $isDivider: false });
          return acc;
          }, []))
    ));

  public itemClicked(item: Suggestion): void {
    this.onClick.emit(item);
  }
}
