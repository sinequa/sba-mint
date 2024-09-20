import { NgClass } from '@angular/common';
import { Component, ElementRef, OnDestroy, booleanAttribute, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HashMap, Translation, TranslocoPipe, TranslocoService, provideTranslocoScope } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { AppStore, AutocompleteService, CJson, DrawerStackService, QueryParamsStore } from '@sinequa/atomic-angular';
import { toast } from 'ngx-sonner';
import { Subscription, debounceTime, filter } from 'rxjs';

const DEBOUNCE_DELAY = 300;

const loader = ['en', 'fr'].reduce((acc, lang) => {
  acc[lang] = () => import(`./i18n/${lang}.json`);
  return acc;
}, {} as HashMap<() => Promise<Translation>>)

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [NgClass, FormsModule, TranslocoPipe],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  providers: [provideTranslocoScope({ scope: 'searchInput', loader })]
})
export class SearchInputComponent implements OnDestroy {
  readonly debounced = output<string>();
  readonly validated = output<string>();
  readonly saved = output<void>();
  readonly clicked = output<void>();

  private readonly autocompletePopover = viewChild<ElementRef>('autocompletePopover');

  protected readonly autocompleteService = inject(AutocompleteService);
  private readonly drawerStack = inject(DrawerStackService);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  private readonly appStore = inject(AppStore);
  private readonly route = inject(ActivatedRoute);
  private readonly translocoService = inject(TranslocoService);

  protected readonly autocompletePopoverOpened = computed(() => this.autocompletePopover()?.nativeElement?.isPopoverOpen);
  public readonly showSave = input(false, { transform: booleanAttribute });

  protected readonly allowChatDrawer = signal<boolean>(false);
  public readonly input = signal<string>('');
  protected saveAnimation = signal<boolean>(false);

  protected allowEmptySearch = computed(() => {
    const { queryName } = this.route.snapshot.data;
    return this.appStore.allowEmptySearch(queryName);
  });


  private readonly _subscription = new Subscription();

  constructor(public readonly el: ElementRef) {
    effect(() => {
      const { data } = getState(this.appStore);
      const { features = { allowChatDrawer: false } } = data as CJson;

      this.allowChatDrawer.set(features.allowChatDrawer);
    }, { allowSignalWrites: true })

    effect(() => {
      const { text } = getState(this.queryParamsStore);
      this.setInput(text);
    }, { allowSignalWrites: true })


    this._subscription.add(
      toObservable(this.input)
        .pipe(
          filter(text => text !== undefined),
          debounceTime(DEBOUNCE_DELAY)
        )
        .subscribe(text => this.debounced.emit(text))
    )
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  public closeAutocompletePopover(): void {
    this.autocompletePopover()?.nativeElement?.hidePopover();
  }

  public inputClicked(): void {
    this.autocompletePopover()?.nativeElement?.showPopover();
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
    if (this.allowEmptySearch() === false && this.input() === '') {
      const message = this.translocoService.translate('searchInput.allowEmptySearch');
      toast.info(message)
      return;
    }

    this.validated.emit(this.input());
  }

  protected clearInput(): void {
    this.input.set('');

    if (this.allowEmptySearch()) {
      this.validated.emit('');
    }
  }

  protected saveQuery(): void {
    this.saveAnimation.set(true);
    setTimeout(() => this.saveAnimation.set(false), 1000);

    this.saved.emit();
  }
}
