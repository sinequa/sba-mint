import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, effect, ElementRef, inject, input, output, Signal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HashMap, provideTranslocoScope, Translation, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import {
  AppStore,
  AutocompleteService,
  ButtonComponent,
  CJson,
  debouncedSignal,
  DrawerStackService,
  QueryParamsStore,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';
import { DrawerAdvancedFiltersComponent } from '../drawer/advanced-filters/advanced-filters.component';

const DEBOUNCE_DELAY = 300;

const loader = ['en', 'fr'].reduce(
  (acc, lang) => {
    acc[lang] = () => import(`./i18n/${lang}.json`);
    return acc;
  },
  {} as HashMap<() => Promise<Translation>>
);

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [NgClass, FormsModule, TranslocoPipe, ButtonComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  providers: [provideTranslocoScope({ scope: 'searchInput', loader })]
})
export class SearchInputComponent {
  readonly debounced = output<string>();
  readonly validated = output<string>();
  readonly saved = output<void>();
  readonly clicked = output<void>();

  private readonly autocompletePopover = viewChild<ElementRef>('autocompletePopover');
  private readonly popoverElement: Signal<HTMLDivElement> = computed(() => this.autocompletePopover()?.nativeElement);

  protected readonly autocompleteService = inject(AutocompleteService);
  private readonly drawerStack = inject(DrawerStackService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);

  public readonly showSave = input(false, { transform: booleanAttribute });

  public readonly input = signal<string>('');

  protected readonly allowChatDrawer = signal<boolean>(false);
  protected readonly saveAnimation = signal<boolean>(false);

  protected readonly debounceInputValue = debouncedSignal(this.input, DEBOUNCE_DELAY);

  protected allowEmptySearch = computed(() => {
    const { queryName } = this.route.snapshot.data;
    return this.appStore.allowEmptySearch(queryName);
  });

  allowAdvancedFilters = computed(() => this.appStore.customizationJson()?.allowAdvancedFilters);
  protected readonly overlayOpen = this.autocompleteService.opened;

  /** Returns true if the current search (current input() + filters) is in the saved searches */
  protected isSavedSearch = computed(() => {
    const params = getState(this.queryParamsStore); // to watch params update
    const savedSearches = this.userSettingsStore.savedSearches();
    const url = window.location.hash.substring(1);
    const filtersSplit = url.split('f=');
    const filters = filtersSplit.length > 1 ? JSON.parse(decodeURIComponent(filtersSplit[1].split('&')[0]))[0] : undefined;
    const display = this.input();

    // returns true if a save search matches the display and filters
    return savedSearches.some(search => {
      const searchFiltersSplit = search.url.split('f=');
      const searchFilters = searchFiltersSplit.length > 1 ? JSON.parse(decodeURIComponent(searchFiltersSplit[1].split('&')[0]))[0] : undefined;

      // if one of them has filters and not the other one
      if ((filters && !searchFilters) || (!filters && searchFilters)) return false;

      if (filters && searchFilters) {
        const filtersKeys = Object.keys(filters).sort();
        const searchFiltersKeys = Object.keys(searchFilters).sort();
        const similarKeys = JSON.stringify(filtersKeys) === JSON.stringify(searchFiltersKeys);

        if (!similarKeys) return false; // if one of them has different keys

        for (const key of filtersKeys) {
          if (filters[key] !== searchFilters[key]) return false; // if any value is different
        }
      }

      return search.display === display; // lastly, if the text is similar
    });
  });

  // el is the ElementRef of the component, it is injected by Angular and used by the AutoComplete component
  constructor(public readonly el: ElementRef) {
    effect(() => {
      const value = this.debounceInputValue();
      this.debounced.emit(value);
    });

    effect(
      () => {
        const { data } = getState(this.appStore);
        const { features = { allowChatDrawer: false } } = data as CJson;

        this.allowChatDrawer.set(features.allowChatDrawer);
      },
      { allowSignalWrites: true }
    );

    // first time the component is created, we set the input value from the query params
    effect(
      () => {
        const { text } = getState(this.queryParamsStore);
        this.setInput(text);
      },
      { allowSignalWrites: true }
    );
  }

  public closeAutocompletePopover(): void {
    this.popoverElement().hidePopover();
  }

  public inputClicked(): void {
    this.popoverElement().showPopover();
    this.clicked.emit();
  }

  public setInput(text: string | undefined, silent: boolean = true): void {
    if (text === undefined) return;

    this.input.set(text);
    if (!silent) this.emitText();
  }

  public askAI(): void {
    this.drawerStack.askAI(this.input());
  }

  protected emitText(): void {
    if (this.allowAdvancedFilters() && this.input() === '') {
      this.overlayOpen.set(false);
      this.drawerStack.open(DrawerAdvancedFiltersComponent);
      return;
    }
    if (this.allowEmptySearch() === false && this.input() === '') {
      const message = this.translocoService.translate('searchInput.allowEmptySearch');
      toast.info(message);
      return;
    }

    this.closeAutocompletePopover();
    this.validated.emit(this.input());
  }

  protected clearInput(e: Event): void {
    this.input.set('');
    this.popoverElement().hidePopover();
  }

  protected saveQuery(): void {
    this.saveAnimation.set(true);
    setTimeout(() => this.saveAnimation.set(false), 1000);

    this.saved.emit();
  }

  /**
   * Handles the keydown event on the search input.
   *
   * @param e - The keyboard event triggered by the user.
   *
   * If the 'Enter' key is pressed, the current text is emitted.
   * If the input is not empty and a different key is pressed, the popover is shown (if previously hidden).
   */
  protected onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.emitText();
    } else if (this.input() !== '') {
      this.popoverElement().showPopover();
    }
  }
}
