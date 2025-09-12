import { Component, computed, effect, ElementRef, inject, InjectionToken, input, output, signal, Type } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EventManager } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { catchError, combineLatest, from, map, of, switchMap, tap } from 'rxjs';

import { error, Suggestion as S } from '@sinequa/atomic';
import {
  AppStore,
  AuditService,
  AutocompleteService,
  DrawerAdvancedFiltersComponent,
  DrawerStackService,
  HighlightWordPipe,
  UserSettingsStore
} from '@sinequa/atomic-angular';

import {
  BookmarkIcon,
  BuildingIcon,
  ButtonComponent,
  ClockIcon,
  FileIcon,
  HorizontalDividerComponent,
  LightbulbIcon,
  ListItemComponent,
  MapPinIcon,
  SearchIcon,
  StarIcon,
  UserIcon
} from '@sinequa/ui';

import { NgComponentOutlet } from '@angular/common';
import { SearchComponent } from '../search.component';

const AUTOCOMPLETE_CATEGORIES_SORT_PREFERENCES = new InjectionToken("Order by preference for suggestion's categories", {
  factory: () => ['full-text', 'recent-search', 'saved-search', 'bookmark', 'title', 'concepts', 'people']
});
// Icons mapping for each category - returns SVG strings
const AUTOCOMPLETE_CATEGORIES_ICONS = new InjectionToken<Record<string, Type<unknown>>>('Icons for each suggestion categories', {
  factory: () => ({
    'recent-search': ClockIcon, // Clock icon
    'saved-search': StarIcon, // Star icon
    bookmark: BookmarkIcon, // Bookmark icon
    'full-text': SearchIcon, // Search icon
    title: FileIcon, // File icon
    concepts: LightbulbIcon, // Lightbulb icon
    people: UserIcon, // User icon
    company: BuildingIcon, // Building icon
    location: MapPinIcon // Map pin icon
  })
});

type Suggestion = Partial<S> & {
  $isDivider?: boolean;
  $isTitle?: boolean;
};

export type ActiveSuggestion = { id: string; item: S } | undefined;

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  imports: [NgComponentOutlet, HighlightWordPipe, TranslocoPipe, ListItemComponent, HorizontalDividerComponent, ButtonComponent, HorizontalDividerComponent],
  styles: [
    `
      :host {
        display: block;
      }

      ul {
        scrollbar-width: thin;
      }
    `
  ]
})
export class AutocompleteComponent {
  readonly text = input<string>('');
  readonly onClick = output<S>();
  readonly activeDescendant = output<ActiveSuggestion>();

  readonly wasSearchClicked = signal(false);
  readonly currentSuggestIndex = signal(-1);

  readonly autocompleteService = inject(AutocompleteService);
  readonly auditService = inject(AuditService);
  readonly appStore = inject(AppStore);
  readonly userSettingsStore = inject(UserSettingsStore);
  private readonly drawerStack = inject(DrawerStackService);

  // Order by preference for suggestion's categories
  readonly autocompleteCategories = inject(AUTOCOMPLETE_CATEGORIES_SORT_PREFERENCES);
  // Icons mapping for each category
  readonly autocompleteIcons = inject(AUTOCOMPLETE_CATEGORIES_ICONS);
  // used to scroll the selected suggest in view
  private readonly elRef = inject(ElementRef);

  protected readonly overlayOpen = this.autocompleteService.opened;

  autocomplete = computed(() => this.appStore.customizationJson()?.autocomplete);
  advancedSearch = computed(() => {
    const advancedSearch = this.appStore.general()?.features?.advancedSearch;
    return advancedSearch || false;
  });

  readonly suggestions = toSignal(
    combineLatest([toObservable(this.text), toObservable(this.wasSearchClicked)]).pipe(
      tap(() => this.currentSuggestIndex.set(-1)),
      switchMap(([testText]) => {
        const fromUserSettings = of(this.autocompleteService.getFromUserSettingsForText(testText, this.autocomplete() ?? 3));

        if (!testText) return fromUserSettings;

        return combineLatest([
          fromUserSettings,
          from(this.autocompleteService.getFromSuggestQueriesForText(testText)).pipe(
            catchError(err => {
              error('Error getting suggestions from suggest queries', err);
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
      map(items =>
        items.reduce<Suggestion[]>((acc, curr) => {
          if (acc.length > 0) {
            const last = acc.at(-1);

            // add a divider before specific categories
            if (!last?.$isDivider && last?.category !== curr.category) {
              acc.push({ $isDivider: true });
              acc.push({ category: curr.category, $isDivider: false, $isTitle: true });
            }
          } else {
            acc.push({ category: curr.category, $isDivider: false, $isTitle: true });
          }

          acc.push({ ...curr, $isDivider: false });
          return acc;
        }, [])
      )
    )
  );

  constructor(
    { el: { nativeElement } }: SearchComponent,
    private eventManager: EventManager
  ) {
    this.eventManager.addEventListener(nativeElement, 'click', () => this.wasSearchClicked.set(true));

    effect(() => {
      if (!this.suggestions() || this.suggestions()!.length === 0) return;

      const index = this.currentSuggestIndex();

      if (index < 0 || index >= this.suggestions()!.length) this.activeDescendant.emit(undefined);
      else
        this.activeDescendant.emit({
          id: `search-suggestion-${index}`,
          item: this.suggestions()![index] as S
        });
    });
  }

  openAdvancedSearch(): void {
    this.overlayOpen.set(false);
    this.drawerStack.open(DrawerAdvancedFiltersComponent);
  }

  getIconForCategory(category: string | undefined): Type<unknown> {
    return this.autocompleteIcons[category || ''] || SearchIcon; // Default search icon
  }

  // #region Keyboard navigation

  nextSuggestion = () => this.findSuggestion(1);
  previousSuggestion = () => this.findSuggestion(-1);

  private findSuggestion(direction: number): void {
    if (!this.suggestions() || this.suggestions()!.length === 0) return;

    let index = this.currentSuggestIndex();

    do {
      index += direction;
      if (index < 0) index = this.suggestions()!.length - 1;
      else if (index >= this.suggestions()!.length) index = 0;
    } while (this.suggestions()![index].$isDivider || this.suggestions()![index].$isTitle);

    this.currentSuggestIndex.set(index);
    this.elRef.nativeElement.querySelector(`#search-suggestion-${index}`)?.scrollIntoView({
      block: 'nearest'
    });
  }

  // #endregion Keyboard navigation
}
