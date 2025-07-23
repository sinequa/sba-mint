import { NgClass } from '@angular/common';
import { booleanAttribute, Component, computed, effect, ElementRef, inject, input, model, output, Signal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';

import { CCApp } from '@sinequa/atomic';
import {
  APP_FEATURES,
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

import { ActiveSuggestion } from './autocomplete/autocomplete.component';

@Component({
  selector: 'app-search-input',
  imports: [NgClass, RouterLink, FormsModule, TranslocoPipe, ButtonComponent, SendHorizontalIconComponent, InputComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  host: {
    '[class]': 'cn("rounded-2xl", this.variant() === "basic" && "rounded-lg", "rounded-bl-none rounded-br-none")',
    '(keydown.enter)': 'emitText($event)'
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

  public readonly searchInputText = model<string>('');

  protected readonly saveAnimation = signal<boolean>(false);

  filters = computed(() => {
    const { filters } = getState(this.queryParamsStore);
    return filters ? JSON.stringify(filters) : undefined;
  });

  hasFilters = computed(() => {
    // when the query parameters store updates, update the hasFilters signal
    // to show or hide the clear filters button
    const { filters } = getState(this.queryParamsStore);
    return Array.isArray(filters) && filters.length > 0;
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

  protected readonly debounceInputValue = debouncedSignal(this.searchInputText, 300);

  protected allowEmptySearch = computed(() => {
    const { queryName } = this.route.snapshot.data;
    return this.appStore.allowEmptySearch(queryName);
  });

  allowAdvancedFilters = computed(() => this.appStore.customizationJson()?.allowAdvancedFilters);
  protected readonly overlayOpen = this.autocompleteService.opened;

  /** Returns true if the current search (current input() + filters) is in the saved searches */
  protected savedSearch = computed(() => this.userSettingsStore.getSavedSearch(this.searchInputText()));

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

    this.searchInputText.set(text);
    if (!silent) this.emitText(new Event('input'));
  }

  protected emitText(e: Event): void {
    e.stopImmediatePropagation();
    if (this.allowAdvancedFilters() && this.searchInputText() === '') {
      this.overlayOpen.set(false);
      this.drawerStack.open(DrawerAdvancedFiltersComponent);
      return;
    }
    if (this.allowEmptySearch() === false && this.searchInputText()?.length === 0) {
      const message = this.translocoService.translate('searchInput.allowEmptySearch');
      console.warn(message);
      toast.info(message);
      return;
    }

    const text = this.searchInputText();
    if (text) {
      this.closeAutocompletePopover();
      this.validated.emit(text);
    }
  }

  protected clearInput(e: Event): void {
    this.searchInputText.set('');
    this.popoverElement().hidePopover();
  }

  protected saveQuery(event: Event): void {
    event.stopPropagation();

    if (this.savedSearch()) {
      // no animation when unsaving
      this.saved.emit(this.savedSearch());
    } else {
      this.dialogService.open(SavedSearchDialog, this.searchInputText()).then((event: any) => {
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

  onSelected($event: HTMLElement | null): void {
    this.closeAutocompletePopover();
    this.searchInputText.set($event?.getAttribute('data-text') || '');
    this.selected.emit($event);
  }
}
