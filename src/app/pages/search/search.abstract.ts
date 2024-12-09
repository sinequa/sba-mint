import { Component, computed, effect, HostBinding, inject, input, OnDestroy, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getState } from "@ngrx/signals";
import { injectInfiniteQuery } from "@tanstack/angular-query-experimental";
import { lastValueFrom, map, Subscription, tap } from "rxjs";

import { Aggregation, Article, Query, QueryParams, Result } from "@sinequa/atomic";
import { AggregationsStore, DrawerStackService, PrincipalStore, QueryParamsStore, SearchService, SelectionService, UserSettingsStore } from "@sinequa/atomic-angular";


type R = Result & { nextPage?: number, previousPage?: number };
type QP = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
  q?: string; // query text
}

@Component({
  template: ''
})
export abstract class SearchBase<T> implements OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  protected readonly result = signal<Result | undefined>(undefined);
  protected readonly queryText = signal<string>('');
  protected readonly assistantCollapsed = signal<boolean>(true);

  protected readonly searchService = inject(SearchService);
  protected readonly drawerStack = inject(DrawerStackService);
  protected readonly selectionService = inject(SelectionService);

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
    const state = getState(this.queryParamsStore)
    const r = { tab: state.tab, text: state.text, filters: state.filters, sort: state.sort };
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


  // input url bindings
  q = input<string>(); // text
  t = input<string>(); // tab
  s = input<string>(); // sort
  f = input<string>(); // filters
  queryName = input<string>(); // query param


  // tanstack query
  query = injectInfiniteQuery<R,T>(() => ({
    queryKey: [`search-${this.t()}`, this.keys(), this.userOverrideActive()],
    queryFn: ({ pageParam }) => {
      const q = this.queryParamsStore.getQuery();

      const query = { ...q, page: pageParam, tab: this.t() } as Query;

      // Add the current search to the user settings when the text is not empty
      if(query.text && query.text !== '') {
        this.usersettingsStore.addCurrentSearch(query as QueryParams);
      }

      return lastValueFrom(this.searchService.getResult(query).pipe(
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
      ));
    },
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => (firstPage.previousPage ?? undefined),
    getNextPageParam: (lastPage) => (lastPage.nextPage ?? undefined),
  }));

  constructor() {
    // Update the query params store with the filters from the query params
    // This allows Browser back/forward to work correctly
    effect(() => {
      const filters = this.f() ? JSON.parse(this.f() ?? '') : []; // Parse the filters from the query params
      this.queryParamsStore.patch({ text: this.q(), tab: this.t(), sort: this.s(), filters, name: this.queryName() });
    }, { allowSignalWrites: true });

    // Update the URL with the query params
    effect(() => {
      const key = this.keys();

      const queryParams: QP = {};
      const { text, filters = [], page, sort, tab } = getState(this.queryParamsStore);

      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
      queryParams.t = tab;
      queryParams.q = text;

      this.router.navigate([], { relativeTo: this.route, queryParamsHandling: 'merge', queryParams, state: {  } });
    })

    // Make Result object available to children and update aggregations store
    effect(() => {
      this.query.isSuccess();

      const result = this.query.data()?.pages[0];

      if (!result) return;

      this.result.set(result);

      // Update the aggregations store with the new aggregations
      this.aggregationsStore.update(result.aggregations);
    }, { allowSignalWrites: true });

    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened = state)
    );
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
}