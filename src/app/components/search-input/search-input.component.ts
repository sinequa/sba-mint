import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, effect, ElementRef, inject, input, model, output, Signal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';

import { CCApp } from '@sinequa/atomic';
import {
  AppStore,
  AutocompleteService,
  debouncedSignal,
  DrawerAdvancedFiltersComponent,
  DrawerStackService,
  SearchInputComponent as InputComponent,
  QueryParamsStore,
  SavedSearchDialog,
  SearchItem,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import { ButtonComponent, cn, DialogService, InputSearchVariants, SendHorizontalIconComponent } from '@sinequa/ui';

import { APP_FEATURES } from '../../tokens';
import { ActiveSuggestion } from './autocomplete/autocomplete.component';

@Component({
  selector: 'app-search-input',
  imports: [NgClass, RouterLink, FormsModule, TranslocoPipe, ButtonComponent, SendHorizontalIconComponent, InputComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  host: {
    '[class]': 'cn("rounded-2xl", this.variant() === "basic" && "rounded-lg", "rounded-bl-none rounded-br-none")'
  },
  providers: [provideTranslocoScope('search-input')]
})
export class SearchInputComponent {
  cn = cn;
  public readonly showSave = input(false, { transform: booleanAttribute });
  public readonly variant = input<InputSearchVariants['variant']>('default');
  public readonly activeDescendant = input<ActiveSuggestion>();

  readonly debounced = output<string>();
  readonly validated = output<string>();
  readonly saved = output<SearchItem | undefined>();
  readonly selected = output<HTMLElement | null>();

  private readonly autocompletePopover = viewChild<ElementRef>('autocompletePopover');
  private readonly popoverElement: Signal<HTMLDivElement> = computed(() => this.autocompletePopover()?.nativeElement);

  protected readonly autocompleteService = inject(AutocompleteService);
  private readonly drawerStack = inject(DrawerStackService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  private readonly appStore = inject(AppStore);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);
  private readonly dialogService = inject(DialogService);
  private readonly appFeatures = inject(APP_FEATURES);

  public readonly value = model<string>('');

  protected readonly saveAnimation = signal<boolean>(false);

  hasFilters = computed(() => {
    // when the query parameters store updates, update the hasFilters signal
    // to show or hide the clear filters button
    const state = getState(this.queryParamsStore);
    return Array.isArray(state.filters) && state.filters.length > 0;
  });

  protected readonly allowAI = computed(() => this.appStore.isAssistantAllowed(this.instanceId()));
  readonly instanceId = computed(() => {
    const {
      assistant: { usePrefixName = true }
    } = this.appFeatures;
    if (usePrefixName) {
      const { name } = getState(this.appStore) as CCApp;
      return `${name}-standalone-assistant`;
    } else {
      return 'standalone-assistant';
    }
  });

  protected readonly debounceInputValue = debouncedSignal(this.value, 300);

  protected allowEmptySearch = computed(() => {
    const { queryName } = this.route.snapshot.data;
    return this.appStore.allowEmptySearch(queryName);
  });

  allowAdvancedFilters = computed(() => this.appStore.customizationJson()?.allowAdvancedFilters);
  protected readonly overlayOpen = this.autocompleteService.opened;

  /** Returns true if the current search (current input() + filters) is in the saved searches */
  protected savedSearch = computed(() => {
    const savedSearches = this.userSettingsStore.savedSearches();
    const url = window.location.hash.substring(1);
    const filtersSplit = url.split('f=');
    const filters = filtersSplit.length > 1 ? JSON.parse(decodeURIComponent(filtersSplit[1].split('&')[0]))[0] : undefined;
    const text = this.value();

    // returns true if a save search matches the display and filters
    return savedSearches.find(search => {
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

      return (search as any).label === text; // lastly, if the text is similar
    });
  });

  // el is the ElementRef of the component, it is injected by Angular and used by the AutoComplete component
  constructor(public readonly el: ElementRef) {
    effect(() => {
      const value = this.debounceInputValue();
      this.debounced.emit(value);
    });

    // first time the component is created, we set the input value from the query params
    effect(() => {
      const { text } = getState(this.queryParamsStore);
      this.setInput(text);
    });
  }

  public closeAutocompletePopover(): void {
    this.popoverElement().hidePopover();
  }

  public inputClicked(): void {
    this.popoverElement().showPopover();
  }

  public setInput(text: string | undefined, silent: boolean = true): void {
    if (text === undefined) return;

    this.value.set(text);
    if (!silent) this.emitText(new Event('input'));
  }

  protected emitText(e: Event): void {
    e.stopImmediatePropagation();
    if (this.allowAdvancedFilters() && this.value() === '') {
      this.overlayOpen.set(false);
      this.drawerStack.open(DrawerAdvancedFiltersComponent);
      return;
    }
    if (this.allowEmptySearch() === false && this.value() === '') {
      const message = this.translocoService.translate('searchInput.allowEmptySearch');
      toast.info(message);
      return;
    }

    this.closeAutocompletePopover();
    this.validated.emit(this.value());
  }

  protected clearInput(e: Event): void {
    this.value.set('');
    this.popoverElement().hidePopover();
  }

  protected saveQuery(event: Event): void {
    event.stopPropagation();

    if (this.savedSearch()) {
      this.saveAnimation.set(true);
      setTimeout(() => this.saveAnimation.set(false), 1000);
      this.saved.emit(this.savedSearch());
    } else {
      this.dialogService.open(SavedSearchDialog, this.value()).then((event: any) => {
        if (event === 'dialog-confirm') {
          this.saveAnimation.set(true);
          setTimeout(() => this.saveAnimation.set(false), 1000);
        }
      });
    }
  }

  focus(): void {
    this.popoverElement().showPopover();
  }

  blur(): void {
    this.popoverElement().hidePopover();
  }
}
