import { NgClass } from '@angular/common';
import { Component, HostBinding, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { Subscription, lastValueFrom, map, tap } from 'rxjs';

import { Aggregation, Article, Query, Result } from '@sinequa/atomic';
import { AggregationsStore, DrawerStackService, InfinityScrollDirective, QueryParamsStore, QueryService, SearchService, SelectArticleFromQueryParamsDirective, SelectArticleOnClickDirective, UserSettingsStore } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/core/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/core/components/article/default/article-default.component';
import { FiltersComponent } from '@/core/components/filters/filters.component';
import { DidYouMeanComponent } from '@/core/features/did-you-mean/did-you-mean.component';
import { SortSelectorComponent, SortingChoice } from '@/core/features/sort-selector/sort-selector.component';



type R = Result & { nextPage?: number, previousPage?: number };

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [
    NgClass,
    SelectArticleOnClickDirective,
    FiltersComponent,
    ArticleDefaultComponent,
    ArticleDefaultSkeletonComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective
  ],
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
  host: {
    class: 'layout-search overflow-auto h-full'
  },
  hostDirectives: [{
    directive: SelectArticleFromQueryParamsDirective,
    inputs: ['articleId: id', 'aggregations']
  }]
})
export class SearchAllComponent implements OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  items = Array.from({ length: 100000 }).map((_, i) => `Item #${i}`);

  public readonly id = input<string | undefined>();

  readonly result = signal<Result | undefined>(undefined);
  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');

  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly userSettingsStore = inject(UserSettingsStore);

  protected aggregations: Aggregation[];

  private readonly sub = new Subscription();

  // track the query params store changes
  keys = computed(() => {
    const state = getState(this.queryParamsStore)
    const r = { tab: state.tab, text: state.text, filters: state.filters, sort: state.sort }
    return r;
  });

  // tanstack query
  query = injectInfiniteQuery<R>(() => ({
    queryKey: ["search-all", this.keys()],
    queryFn: ({ pageParam }) => {
      const q = this.searchService.getQuery();
      const query = { ...q, page: pageParam } as Query;

      return lastValueFrom(this.queryService.search(query).pipe(
        tap(() => {
          const queryParams = getState(this.queryParamsStore);
          // Add the current search to the user settings only if there is a text query
          if (queryParams.text) {
            this.userSettingsStore.addCurrentSearch(queryParams);
          }
        }),
        map(result => {
          result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'default' })));
          return result;
        }),
        map(result => {
          const r = ({ ...result, nextPage: result.page < Math.ceil(result.rowCount / result.pageSize) ? result.page + 1 : undefined, previousPage: result.page > 1 ? result.page - 1 : undefined })
          return r;
        })
      ));
    },
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => (firstPage.previousPage ?? undefined),
    getNextPageParam: (lastPage) => (lastPage.nextPage ?? undefined),
  }));

  constructor() {
    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened = state)
    );

    // Trigger skeleton on search whether from input or from filters
    effect(() => {
      getState(this.queryParamsStore);
      this.articles.set(undefined);
    }, { allowSignalWrites: true });

    // Make Result object available to children and update aggregations store
    effect(() => {
      this.query.isSuccess();

      const result = this.query.data()?.pages[0];

      if (!result) return;

      this.result.set(result);

      // Update the aggregations store with the new aggregations
      this.aggregationsStore.update(result.aggregations);
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.aggregationsStore.clear();
  }

  onSort(sort: SortingChoice): void {
    this.queryParamsStore.patch({ sort: sort.name });

    this.articles.set(undefined);
    this.searchService.search([]);
  }

  nextPage() {
    this.query.fetchNextPage();
  }
}
