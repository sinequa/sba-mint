import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, HostBinding, OnDestroy, Type, computed, effect, inject, input, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { Subscription, lastValueFrom, map } from 'rxjs';

import { Aggregation, Article, Query, Result } from '@sinequa/atomic';
import { AggregationsStore, DrawerStackService, InfinityScrollDirective, PrincipalStore, QueryParamsStore, SearchService, SelectionService } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/core/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/core/components/article/default/article-default.component';
import { FiltersComponent } from '@/core/components/filters/filters.component';
import { SponsoredResultsComponent } from "@/core/components/sponsored-results/sponsored-results.component";
import { DidYouMeanComponent } from '@/core/features/did-you-mean/did-you-mean.component';
import { SortSelectorComponent, SortingChoice } from '@/core/features/sort-selector/sort-selector.component';
import { getComponentsForDocumentType } from '@/core/registry/document-type-registry';

type R = Result & { nextPage?: number, previousPage?: number };

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [
    NgClass,
    NgComponentOutlet,
    FiltersComponent,
    ArticleDefaultComponent,
    ArticleDefaultSkeletonComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    InfinityScrollDirective,
    SponsoredResultsComponent
  ],
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
  host: {
    class: 'layout-search overflow-auto h-full'
  }
})
export class SearchAllComponent implements OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  readonly result = signal<Result | undefined>(undefined);
  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');

  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly selectionService = inject(SelectionService);
  private readonly principalStore = inject(PrincipalStore);

  protected aggregations: Aggregation[];

  private readonly sub = new Subscription();

  // track the query params store changes
  keys = computed(() => {
    const state = getState(this.queryParamsStore);
    return { text: state.text, filters: state.filters, sort: state.sort }
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
  query = injectInfiniteQuery<R>(() => ({
    queryKey: [`search-${this.t()}`, this.keys(), this.userOverrideActive()],
    queryFn: ({ pageParam }) => {
      const q = this.queryParamsStore.getQuery();
      console.log('q', this.keys());
      const query = { ...q, page: pageParam, tab: this.t(), name: this.queryName() } as Query;

      return lastValueFrom(this.searchService.getResult(query).pipe(
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
      this.queryParamsStore.patch({ text: this.q(), tab: this.t(), sort: this.s(), filters, queryName: this.queryName() });
    }, { allowSignalWrites: true });

    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened = state)
    );

    // Trigger skeleton on search whether from input or from filters
    effect(() => {
      getState(this.queryParamsStore);

      // Reset the articles when the query params store changes
      this.articles.set(undefined);

      // update URL Search Params when the query params store changes
      this.searchService.search([]);

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
    this.searchService.search([], {
      audit: {
        type: "Search_Sort",
        detail: {
          sort: sort.name,
          orderByClause: sort.orderByClause,
        }
      }
    });
  }

  nextPage() {
    this.query.fetchNextPage();
  }

  getArticleType(docType: string): Type<unknown> {
    return getComponentsForDocumentType(docType).articleComponent;
  }
}
