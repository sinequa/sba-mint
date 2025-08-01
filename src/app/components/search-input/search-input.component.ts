import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { booleanAttribute, Component, computed, DestroyRef, effect, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';
import { debounceTime } from 'rxjs';

import { CCApp } from '@sinequa/atomic';
import {
  APP_FEATURES,
  AppStore,
  AutocompleteService,
  DrawerAdvancedFiltersComponent,
  DrawerStackService,
  SearchInputComponent as InputComponent,
  QueryParamsStore,
  SavedSearchesService,
  SearchItem,
  UserSettingsStore
} from '@sinequa/atomic-angular';
import {
  ButtonComponent,
  cn,
  DialogService,
  DropdownComponent,
  DropdownContentComponent,
  InputSearchVariants,
  PopoverComponent,
  PopoverContentComponent,
  SendHorizontalIconComponent
} from '@sinequa/ui';

import { ActiveSuggestion } from './autocomplete/autocomplete.component';

@Component({
  selector: 'app-search-input',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslocoPipe,
    ButtonComponent,
    SendHorizontalIconComponent,
    InputComponent,
    DropdownComponent,
    DropdownContentComponent,
    PopoverComponent,
    PopoverContentComponent,
    InputComponent
  ],
  templateUrl: './search-input.component.html',
  host: {
    '[class]': 'cn("rounded-2xl", this.variant() === "basic" && "rounded-lg", "rounded-bl-none rounded-br-none")',
    '(keydown.enter)': 'emitText($event)'
  },
  styles: [
    `
      :host {
        /* Hides cancel button from input that as type='search' */
        input[type='search']::-webkit-search-cancel-button {
          -webkit-appearance: none;
        }
      }
    `
  ],
  providers: [provideTranslocoScope('search-input')]
})
export class SearchInputComponent {
  cn = cn;

  popoverComponent = viewChild.required(PopoverComponent);
  dropdownComponent = viewChild.required(DropdownComponent);
  InputComponent = viewChild.required<InputComponent>(InputComponent);

  protected readonly route = inject(ActivatedRoute);
  protected readonly autocompleteService = inject(AutocompleteService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly appStore = inject(AppStore);
  protected readonly translocoService = inject(TranslocoService);
  protected readonly dialogService = inject(DialogService);
  protected readonly appFeatures = inject(APP_FEATURES);
  protected readonly savedSearchesService = inject(SavedSearchesService);

  public readonly showSave = input(false, { transform: booleanAttribute });
  public readonly variant = input<InputSearchVariants['variant']>('default');
  public readonly activeDescendant = input<ActiveSuggestion>();

  readonly debounced = output<string>();
  readonly validated = output<string>();
  readonly saved = output<SearchItem | undefined>();
  readonly selected = output<HTMLElement | null>();

  // focus monitor
  protected readonly lastFocusOrigin = signal<FocusOrigin>(null);
  private readonly focusMonitor = inject(FocusMonitor);

  public readonly searchInputText = model<string>('');

  protected readonly saveAnimation = signal<boolean>(false);

  readonly saveNameInput = viewChild<ElementRef>('saveNameInput');
  public readonly saveName = signal<string>('');
  // used to prevent opening the suggestions dropdown if the saved search is opened
  protected readonly openedSavedSearch = signal<boolean>(false);

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

  protected allowEmptySearch = computed(() => {
    const { queryName } = this.route.snapshot.data;
    return this.appStore.allowEmptySearch(queryName);
  });

  allowAdvancedFilters = computed(() => this.appStore.customizationJson()?.allowAdvancedFilters);
  protected readonly overlayOpen = this.autocompleteService.opened;

  /** Returns true if the current search (current input() + filters) is in the saved searches */
  protected savedSearch = computed(() => this.userSettingsStore.getSavedSearch(this.searchInputText()));

  protected form = new FormGroup({
    searchInputText: new FormControl(this.searchInputText(), { nonNullable: true })
  });

  // el is the ElementRef of the component, it is injected by Angular and used by the AutoComplete component
  public readonly el = inject(ElementRef);
  protected readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.form.controls.searchInputText.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300)).subscribe((value: string) => {
      this.searchInputText.set(value);
      this.debounced.emit(value);
    });

    // first time the component is created, we set the input value from the query params
    effect(() => {
      const { text } = getState(this.queryParamsStore);
      this.form.controls.searchInputText.setValue(text || '');
    });

    // focus monitor to track focus origin
    effect(() => {
      this.focusMonitor
        .monitor(this.InputComponent().searchInput(), true)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(origin => {
          this.lastFocusOrigin.set(origin);
          if (origin === 'keyboard') {
            this.dropdownComponent().toggle();
          }
        });
    });
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
      this.validated.emit(text);
    }
  }

  onSearch(e: Event) {
    e.stopImmediatePropagation();
    this.dropdownComponent().close();
    if (this.allowEmptySearch() === false && this.searchInputText()?.length === 0) {
      const message = this.translocoService.translate('searchInput.allowEmptySearch');
      console.warn(message);
      toast.info(message);
      return;
    }

    const text = this.searchInputText();
    this.validated.emit(text);
  }

  protected saveQuery(event: Event): void {
    event.stopPropagation();

    if (this.savedSearch()) {
      // no animation when unsaving
      this.saved.emit(this.savedSearch());
    } else {
      this.savedSearchesService.saveSearch(this.saveName());
      this.saveAnimation.set(true);
      setTimeout(() => this.saveAnimation.set(false), 1000);
      this.popoverComponent().close();
    }
  }

  onSelected($event: HTMLElement | null): void {
    this.form.controls.searchInputText.setValue($event?.getAttribute('data-text') || '');
    this.searchInputText.set($event?.getAttribute('data-text') || '');
    this.selected.emit($event);
  }

  openSavedSearch(): void {
    this.saveNameInput()!.nativeElement.value = '';
    this.saveName.set('');
    this.openedSavedSearch.set(true);
    setTimeout(() => {
      this.saveNameInput()?.nativeElement.focus();
    }, 1);
  }
}
