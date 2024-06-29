import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EventManager } from '@angular/platform-browser';
import { HashMap, Translation, TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { combineLatest, map, of, switchMap } from 'rxjs';

import { Suggestion as SuggestionBasic } from '@sinequa/atomic';
import { AppStore, AutocompleteService, HighlightWordPipe, UserSettingsStore } from '@sinequa/atomic-angular';

import { SearchInputComponent } from '../search-input.component';

export type Suggestion = Partial<SuggestionBasic> & {
  $isDivider: boolean;
}

const titledSections = ['title', 'concepts', 'people', 'bookmark', 'recent-search', 'saved-search'];
const autocompleteCategories = ['full-text', 'recent-search', 'saved-search',  'bookmark', 'title', 'concepts', 'people'];

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`../i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  templateUrl: './autocomplete.component.html',
  imports: [AsyncPipe, NgIf, NgClass, HighlightWordPipe, TranslocoPipe],
  providers: [provideTranslocoScope({ scope: 'search-input', loader })]
})
export class AutocompleteComponent {
  readonly text = input<string>('');
  readonly wasSearchClicked = signal(false);

  @Output() readonly onClick = new EventEmitter<Suggestion>();

  readonly autocompleteService = inject(AutocompleteService);
  readonly appStore = inject(AppStore);
  readonly userSettingsStore = inject(UserSettingsStore);

  autocomplete = computed(() => this.appStore.customizationJson()?.autocomplete);

  readonly items = toSignal(
    combineLatest([toObservable(this.text), toObservable(this.wasSearchClicked)])
      .pipe(
        switchMap(([testText]) => {

          const fromUserSettings = of(this.autocompleteService.getFromUserSettingsForText(testText, this.autocomplete() ?? 3));
          if (!testText) {
            return fromUserSettings;
          }

          return combineLatest([
            fromUserSettings,
            this.autocompleteService.getFromSuggestQueriesForText(testText)
          ]);
        }),
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
    ));

  constructor({ el: { nativeElement } }: SearchInputComponent, private eventManager: EventManager) {
    this.eventManager.addEventListener(nativeElement, 'click', () => this.wasSearchClicked.set(true));
  }

  public itemClicked(item: Suggestion): void {
    this.onClick.emit(item);
  }
}
