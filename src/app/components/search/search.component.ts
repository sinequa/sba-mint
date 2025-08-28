import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { booleanAttribute, Component, computed, DestroyRef, effect, ElementRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { provideTranslocoScope, TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject } from 'rxjs';

import { CCApp } from '@sinequa/atomic';
import {
  APP_FEATURES,
  AppStore,
  AutocompleteService,
  DrawerAdvancedFiltersComponent,
  DrawerStackService,
  QueryParamsStore,
  SearchInputComponent,
  SearchItem
} from '@sinequa/atomic-angular';
import {
  ButtonComponent,
  cn,
  DialogService,
  DropdownComponent,
  DropdownContentComponent,
  PopoverComponent,
  SendHorizontalIconComponent,
  type SearchVariants
} from '@sinequa/ui';

import { ActiveSuggestion } from './autocomplete/autocomplete.component';
import { SavedSearchPopover } from './saved-search-popover/saved-search-popover';

@Component({
  selector: 'app-search',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    ButtonComponent,
    SendHorizontalIconComponent,
    DropdownComponent,
    DropdownContentComponent,
    SearchInputComponent,
    SavedSearchPopover
  ],
  templateUrl: './search.component.html',
  host: {
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
export class SearchComponent {
  cn = cn;

  // "saved search" popover reference
  popoverComponent = viewChild.required(PopoverComponent);
  // autocomplete dropdown reference
  dropdownComponent = viewChild.required(DropdownComponent);
  // search input reference
  inputComponent = viewChild.required<SearchInputComponent>(SearchInputComponent);

  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly autocompleteService = inject(AutocompleteService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly appStore = inject(AppStore);
  protected readonly translocoService = inject(TranslocoService);
  protected readonly dialogService = inject(DialogService);
  protected readonly appFeatures = inject(APP_FEATURES);

  public readonly showSave = input(false, { transform: booleanAttribute });
  public readonly variant = input<SearchVariants['variant']>('default');
  public readonly activeDescendant = input<ActiveSuggestion>();

  readonly debounced = output<string>();
  readonly validated = output<string>();
  readonly saved = output<SearchItem | undefined>();
  readonly selected = output<HTMLElement | null>();

  // focus monitor
  protected readonly lastFocusOrigin = signal<FocusOrigin>(null);
  private readonly focusMonitor = inject(FocusMonitor);

  public readonly searchInputText = model<string>('');
  private debounceInputText = new Subject<string>();

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

  protected form = new FormGroup({
    searchInputText: new FormControl(this.searchInputText(), { nonNullable: true })
  });

  // el is the ElementRef of the component, it is injected by Angular and used by the AutoComplete component
  public readonly el = inject(ElementRef);
  protected readonly destroyRef = inject(DestroyRef);

  constructor() {
    // on input value change, update directly searchInputText but have debounced to emit with debounceTime
    this.form.controls.searchInputText.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: string) => {
      const changedText = value !== this.searchInputText() && value.length > 0 && this.searchInputText().length > 0;
      this.searchInputText.set(value);
      this.debounceInputText.next(value);

      // open the dropdown if the text has properly changed
      if (changedText && this.lastFocusOrigin() && !this.dropdownComponent().isOpen) {
        this.dropdownComponent().toggle();
      }
    });

    this.debounceInputText.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300)).subscribe((value: string) => {
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
        .monitor(this.inputComponent().searchInput(), true)
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

    const text = this.searchInputText()?.trim();
    if (this.allowEmptySearch() || !!text) {
      this.validated.emit(text);
      this.dropdownComponent().close();
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

  onSelected($event: HTMLElement | null): void {
    const dataText = $event?.getAttribute('data-text');
    if (!dataText) return;

    this.form.controls.searchInputText.setValue(dataText);
    this.searchInputText.set(dataText);
    this.selected.emit($event);
  }

  handleRouting(e: Event): void {
    // to prevent the routerLink to be triggered when selecting an autocomplete item with the keyboard
    e.preventDefault();
    e.stopImmediatePropagation();
    this.router.navigate(['/assistant'], { queryParams: { q: this.searchInputText(), f: this.filters() } });
  }
}
