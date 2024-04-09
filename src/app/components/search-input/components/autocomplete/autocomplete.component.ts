import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, effect, inject, input, signal } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { Suggestion as SuggestionBasic } from '@sinequa/atomic';

import { HighlightWordPipe } from "@/app/pipes/highlight-word.pipe";
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { AppStore } from '@/app/stores';

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

  @Output() readonly onClick = new EventEmitter<Suggestion>();

  readonly autocompleteService = inject(AutocompleteService);
  readonly appStore = inject(AppStore);

  readonly items = signal<Suggestion[]>([]);

  readonly itemsEffect = effect(() => {

    const text = this.text();
    const autocomplete = this.appStore.customizationJson()?.autocomplete;

    combineLatest([
      this.autocompleteService.getFromUserSettingsForText(text, autocomplete ?? 5),
      this.autocompleteService.getFromSuggestQueriesForText(text)
    ]).pipe(
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
    ).subscribe(items => this.items.set(items));
  }, { allowSignalWrites: true })

  public itemClicked(item: Suggestion): void {
    this.onClick.emit(item);
  }
}
