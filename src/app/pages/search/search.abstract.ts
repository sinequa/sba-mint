import { computed, Directive, effect, HostBinding, inject, input, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map, Subscription, tap } from 'rxjs';

import { Aggregation, Article, Query, QueryParams, Result, isNotInputEvent } from '@sinequa/atomic';
import {
  AggregationsStore,
  AppStore,
  DrawerStackService,
  PrincipalStore,
  QueryParamsStore,
  SearchService,
  SelectionService,
  UserSettingsStore
} from '@sinequa/atomic-angular';

type R = Result & { nextPage?: number; previousPage?: number };
type QP = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
  q?: string; // query text
  b?: string; // basket
};

@Directive({
  host: {
    '(keydown.enter)': 'handleKeydownEnter($event)',
    '[attr.drawer-opened]': 'drawerOpened() || false'
  },
  standalone: false
})
export abstract class SearchBase<T> implements OnDestroy {
  drawerOpened = signal(false);

  protected readonly result = signal<Result | undefined>(undefined);
  protected readonly queryText = signal<string>('');

  // the Assistant is expanded and visible by default
  protected readonly assistantCollapsed = signal<boolean>(true);
  protected readonly showAssistant = signal<boolean>(false);

  protected readonly searchService = inject(SearchService);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly selectionService = inject(SelectionService);

  protected readonly appStore = inject(AppStore);
  protected readonly aggregationsStore = inject(AggregationsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly principalStore = inject(PrincipalStore);
  protected readonly usersettingsStore = inject(UserSettingsStore);

  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

  protected aggregations: Aggregation[];

  protected readonly sub = new Subscription();

  // track the query params store changes
  keys = computed(() => {
    const state = getState(this.queryParamsStore);
    const r = { tab: state.tab, text: state.text, filters: state.filters, sort: state.sort, basket: state.basket };
    return r;
  });

  // get the id from the query params store to open the drawer with the preview of the article
  id = computed(() => {
    const state = getState(this.queryParamsStore);
    return state.id;
  });

  // the query must be retriggered when the user override is active
  userOverrideActive = computed(() => {
    const state = getState(this.principalStore);
    return state.userOverrideActive;
  });

  // Whether the feedback button is to hide
  hideFeedback = signal(false);

  // input url bindings
  q = input<string>(); // text
  t = input<string>(); // tab
  b = input<string>(); // basket
  s = input<string>(); // sort
  f = input<string>(); // filters
  queryName = input<string>(); // query param

  // tanstack query
  query = injectInfiniteQuery<R, T>(() => ({
    queryKey: [`search-${this.t()}`, this.keys(), this.userOverrideActive()],
    queryFn: ({ pageParam }) => {
      const q = this.queryParamsStore.getQuery();

      const query = { ...q, page: pageParam, tab: this.t(), basket: this.keys().basket } as Query;
      this.beforeSearch(query);

      // Add the current search to the user settings when the text is not empty
      if (query.text && query.text !== '') {
        this.usersettingsStore.addCurrentSearch(query as QueryParams);
      }

      return lastValueFrom(
        this.searchService.getResult(query).pipe(
          tap(() => this.queryText.set(this.keys().text ?? '')),
          map(result => {
            return this.updateArticleType(result);
          }),
          map(result => {
            // If the id is set, open the drawer with the preview of the article
            const id = this.id();
            if (id) {
              result.records?.forEach(article => {
                if (article.id === id) {
                  this.selectionService.setCurrentArticle(article);
                  this.drawerStack.open();
                }
              });
            }
            return result;
          })
        )
      );
    },
    initialPageParam: 1,
    getPreviousPageParam: firstPage => firstPage.previousPage ?? undefined,
    getNextPageParam: lastPage => lastPage.nextPage ?? undefined
  }));

  constructor() {
    // Update the query params store with the filters from the query params
    // This allows Browser back/forward to work correctly
    effect(() => {
      const filters = this.f() ? JSON.parse(this.f() ?? '') : []; // Parse the filters from the query params
      this.queryParamsStore.patch({ text: this.q(), tab: this.t(), basket: this.b(), sort: this.s(), filters, name: this.queryName() });
    });

    // Update the URL with the query params
    effect(() => {
      const key = this.keys();

      this.hideFeedback.set(false);

      const queryParams: QP = {};
      const { text, filters = [], page, sort, tab, basket } = getState(this.queryParamsStore);

      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
      queryParams.t = tab;
      queryParams.q = text;
      queryParams.b = basket;

      this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge', queryParams, state: {} });
    });

    // Make Result object available to children and update aggregations store
    effect(() => {
      this.query.isSuccess();

      const result = this.query.data()?.pages[0];

      if (!result) return;

      this.result.set(result);

      // Update the aggregations store with the new aggregations
      this.aggregationsStore.update(result.aggregations);
    });

    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.aggregationsStore.clear();
  }

  nextPage() {
    this.query.fetchNextPage();
  }

  /**
   * Updates the article type for each record in the result.
   *
   * This method maps over the `records` array in the `result` object and updates each
   * `article` by adding a `value` property set to the `article.title` and a `type` property
   * set to `'default'`. The updated `result` object is then returned.
   *
   * @param {Result} result - The result object containing an array of records to be updated.
   * @returns {Result} The updated result object with modified article records.
   */
  protected updateArticleType(result: Result) {
    result.records?.map((article: Article) => {
      return { ...article, value: article.title, type: 'default' };
    });
    return result;
  }

  handleKeydownEnter(e: KeyboardEvent) {
    if (isNotInputEvent(e)) {
      e.stopImmediatePropagation(); // required for the drawer to open properly
    }
  }

  /**
   * Checks if the tab search is active.
   *
   * This method retrieves the current query from the query parameters store,
   * then fetches the corresponding query from the app store by its name.
   * It returns the active status of the tab search if available, otherwise returns false.
   *
   * @returns {boolean} - True if the tab search is active, otherwise false.
   */
  isTabSearchActive = computed(() => {
    const q = this.queryParamsStore.getQuery();
    const ccQuery = this.appStore.getQueryByName(q.name);
    return ccQuery?.tabSearch.isActive ?? false;
  });

  protected beforeSearch(query: Query): void {
    // Override this method to perform any actions before the search is performed
  }
}
