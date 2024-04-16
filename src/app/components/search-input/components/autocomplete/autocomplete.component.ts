import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EventManager } from '@angular/platform-browser';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { Suggestion as SuggestionBasic } from '@sinequa/atomic';

import { HighlightWordPipe } from "@/app/pipes/highlight-word.pipe";
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { AppStore, UserSettingsStore } from '@/app/stores';

import { SearchInputComponent } from '../../search-input.component';

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
  readonly wasSearchClicked = signal(false);

  @Output() readonly onClick = new EventEmitter<Suggestion>();

  readonly autocompleteService = inject(AutocompleteService);
  readonly appStore = inject(AppStore);

  userSettingsStore = inject(UserSettingsStore);

  autocomplete = computed(() => this.appStore.customizationJson()?.autocomplete);

  readonly items = toSignal(
    combineLatest([toObservable(this.text), toObservable(this.wasSearchClicked)])
      .pipe(
        switchMap(([testText]) => {

          const fromUserSettings = of(this.autocompleteService.getFromUserSettingsForText(testText, this.autocomplete() ?? 5));
          if (!testText) {
            return fromUserSettings;
          }

          return combineLatest([
            fromUserSettings,
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

  constructor({ el: { nativeElement } }: SearchInputComponent, private eventManager: EventManager) {
    this.eventManager.addEventListener(nativeElement, 'click', () => this.wasSearchClicked.set(true));
  }

  public itemClicked(item: Suggestion): void {
    this.onClick.emit(item);
  }
}
