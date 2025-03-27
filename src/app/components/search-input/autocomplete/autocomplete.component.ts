import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, InjectionToken, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EventManager } from '@angular/platform-browser';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe } from '@jsverse/transloco';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';

import { Suggestion } from '@sinequa/atomic';
import {
  AppStore,
  AuditService,
  AutocompleteService,
  DrawerAdvancedFiltersComponent,
  DrawerStackService,
  HighlightWordPipe,
  UserSettingsStore
} from '@sinequa/atomic-angular';

import { ButtonComponent, HorizontalDividerComponent, ListItemComponent } from '@sinequa/ui';

import { SearchInputComponent } from '../search-input.component';

const AUTOCOMPLETE_CATEGORIES_SORT_PREFERENCES = new InjectionToken("Order by preference for suggestion's categories", {
  factory: () => ['full-text', 'recent-search', 'saved-search', 'bookmark', 'title', 'concepts', 'people']
});
// Icons mapping for each category
const AUTOCOMPLETE_CATEGORIES_ICONS = new InjectionToken<Record<string, string>>('Icons for each suggestion categories', {
  factory: () => ({
    'recent-search': 'fa-fw far fa-history',
    'saved-search': 'fa-fw far fa-bookmark',
    bookmark: 'fa-fw far fa-bookmark',
    title: 'fa-fw far fa-file-alt',
    concepts: 'fa-fw far fa-lightbulb',
    people: 'fa-fw far fa-user',
    company: 'fa-fw far fa-building',
    location: 'fa-fw far fa-location-dot'
  })
});

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`../i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  templateUrl: './autocomplete.component.html',
  imports: [KeyValuePipe, HighlightWordPipe, TranslocoPipe, ListItemComponent, HorizontalDividerComponent, ButtonComponent],
  providers: [provideTranslocoScope({ scope: 'search-input', loader })],
  styles: [
    `
      ul {
        scrollbar-width: thin;
      }
    `
  ]
})
export class AutocompleteComponent {
  readonly text = input<string>('');
  readonly onClick = output<Suggestion>();

  readonly wasSearchClicked = signal(false);

  readonly autocompleteService = inject(AutocompleteService);
  readonly auditService = inject(AuditService);
  readonly appStore = inject(AppStore);
  readonly userSettingsStore = inject(UserSettingsStore);
  private readonly drawerStack = inject(DrawerStackService);

  // Order by preference for suggestion's categories
  readonly autocompleteCategories = inject(AUTOCOMPLETE_CATEGORIES_SORT_PREFERENCES);
  // Icons mapping for each category
  readonly autocompleteIcons = inject(AUTOCOMPLETE_CATEGORIES_ICONS);

  protected readonly overlayOpen = this.autocompleteService.opened;

  autocomplete = computed(() => this.appStore.customizationJson()?.autocomplete);
  advancedSearch = computed(() => {
    const features = this.appStore.customizationJson()?.features;
    return features ? features['advancedSearch'] : false;
  });

  readonly suggestions = toSignal(
    combineLatest([toObservable(this.text), toObservable(this.wasSearchClicked)]).pipe(
      switchMap(([testText]) => {
        const fromUserSettings = of(this.autocompleteService.getFromUserSettingsForText(testText, this.autocomplete() ?? 3));

        if (!testText) return fromUserSettings;

        return combineLatest([
          fromUserSettings,
          this.autocompleteService.getFromSuggestQueriesForText(testText).pipe(
            catchError(error => {
              console.log('Error getting suggestions from suggest queries', error);
              return of([]);
            })
          )
        ]);
      }),
      map(items => items.flat(2)),
      // order the items to have full-text, recent search and saved search at the beginning
      map(items =>
        items.sort((a, b) => {
          return this.autocompleteCategories.indexOf(a.category) - this.autocompleteCategories.indexOf(b.category);
        })
      ),
      map(items => Object.groupBy(items, ({ category }) => category))
    )
  );

  constructor(
    { el: { nativeElement } }: SearchInputComponent,
    private eventManager: EventManager
  ) {
    this.eventManager.addEventListener(nativeElement, 'click', () => this.wasSearchClicked.set(true));
  }

  public itemClicked(item: Suggestion): void {
    this.auditService.notify({
      type: 'Search_Autocomplete',
      detail: {
        display: item.display,
        category: item.category
      }
    });
    this.onClick.emit(item);
  }

  openAdvancedSearch(): void {
    this.overlayOpen.set(false);
    this.drawerStack.open(DrawerAdvancedFiltersComponent);
  }
}
