import { NgClass } from '@angular/common';
import { Component, HostBinding, OnDestroy, computed, effect, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { Subscription, lastValueFrom, map, tap } from 'rxjs';

import { Aggregation, Query, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/app/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { DidYouMeanComponent } from '@/app/components/did-you-mean/did-you-mean.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { PagerComponent } from '@/app/components/pagination/pager.component';
import { SortSelectorComponent, SortingChoice } from '@/app/components/sort-selector/sort-selector.component';
import { InfinityScrollDirective, SelectArticleFromQueryParamsDirective, SelectArticleOnClickDirective } from '@/app/directives';
import { SearchService } from '@/app/services';
import { AggregationsStore, QueryParamsStore, UserSettingsStore } from '@/app/stores';
import { Article } from "@/app/types/articles";


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
    PagerComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective
  ],
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
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
  keys = computed(() =>
    {
      const state = getState(this.queryParamsStore)
      const r = { tab: state.tab, text: state.text, filters: state.filters, sort: state.sort }
      return r;
    });

  // tanstack query
  query = injectInfiniteQuery<R>(() => ({
    queryKey: ["search-all", this.keys()],
    queryFn: ({pageParam}) => {

      const q = this.searchService.getQuery();
      const query = {...q, page: pageParam} as Query;

      return lastValueFrom(this.queryService.search(query).pipe(
        tap(() => this.queryText.set(this.keys().text ?? '')),
        tap(result => this.result.set(result)),
        tap(result => {
          // Update the aggregations store with the new aggregations
          this.aggregationsStore.update(result.aggregations);

          const queryParams = getState(this.queryParamsStore);
          // Add the current search to the user settings only if there is a text query
          if(queryParams.text) {
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
