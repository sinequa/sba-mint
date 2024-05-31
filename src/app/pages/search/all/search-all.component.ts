import { Component, HostBinding, Injector, OnDestroy, computed, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { injectInfiniteQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { Subscription, lastValueFrom, map, switchMap, take, tap } from 'rxjs';

import { Aggregation, Query, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/app/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { PageConfiguration, PagerComponent } from '@/app/components/pagination/pager.component';
import { SortSelectorComponent, SortingChoice } from '@/app/components/sort-selector/sort-selector.component';
import { DidYouMeanComponent } from '@/app/did-you-mean/did-you-mean.component';
import { SelectArticleFromQueryParamsDirective, SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService, SearchService } from '@/app/services';
import { QueryParamsStore, searchInputStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { buildFirstPageQuery } from '@/app/utils';
import { AggregationsStore, ApplicationStore } from '@/stores';

import { NgClass } from '@angular/common';
import { InfinityScrollDirective } from '@/app/directives';
import { AssistantComponent } from "../../../components/assistant/assistant";
import { OverviewPeopleComponent } from '../../components/overview/people/overview-people.component';
import { OverviewSlidesComponent } from '../../components/overview/slides/overview-slides.component';

type R = Result & { nextPage?: number, previousPage?: number };

@Component({
  selector: 'app-search-all',
  standalone: true,
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
  hostDirectives: [{
    directive: SelectArticleFromQueryParamsDirective,
    inputs: ['articleId: id', 'aggregations']
  }],
  imports: [
    NgClass,
    SelectArticleOnClickDirective,
    FiltersComponent,
    OverviewPeopleComponent,
    OverviewSlidesComponent,
    ArticleDefaultComponent,
    ArticleDefaultSkeletonComponent,
    PagerComponent,
    SortSelectorComponent,
    DidYouMeanComponent,
    AssistantComponent,
    InfinityScrollDirective
  ]
})
export class SearchAllComponent implements OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public readonly id = input<string | undefined>();

  readonly result = signal<Result | undefined>(undefined);
  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');
  protected readonly pageConfiguration = signal<PageConfiguration>({ page: 1, rowCount: 0, pageSize: 10 });
  protected readonly assistantCollapsed = signal<boolean>(true);

  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);
  private readonly applicationStore = inject(ApplicationStore);

  isAssistantReady = computed(() => this.applicationStore.assistantReady());
  isStreaming = signal<boolean>(false);

  protected aggregations: Aggregation[];

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });
  private readonly subscription = new Subscription();


  // tanstack query
  queryClient = injectQueryClient();
  query = injectInfiniteQuery<R>(() => ({
    queryKey: ["search-all", getState(this.queryParamsStore)],
    queryFn: ({pageParam}) => {
      const query = {...this.searchService.getQuery(), page: pageParam} as Query;
      return lastValueFrom(this.queryService.search(query).pipe(
        tap(result => this.result.set(result)),
        tap(() => this.queryText.set(searchInputStore.state ?? '')),
        map(result => {
          result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'default' })));
          return result;
        }),
        map(result => {
          const r = ({ ...result, nextPage: result.page < Math.ceil(result.rowCount/result.pageSize) ? result.page +1 : undefined, previousPage: result.page > 1 ? result.page - 1 : undefined})
          return r;
        })
      ));
    },
    initialPageParam: 1,
    getPreviousPageParam: (firstPage) => (firstPage.previousPage ?? undefined),
    getNextPageParam: (lastPage) => (lastPage.nextPage ?? undefined),
  }));

  constructor(private readonly injector: Injector) {
    // Once the navigation ends, we fetch the "first page" of results but only once
    this.subscription.add(
      this.navigationService.navigationEnd$
        .pipe(
          take(1),
          switchMap(() => this.queryService.search(runInInjectionContext(this.injector, () => buildFirstPageQuery({ text: searchInputStore.state }))))
        )
        .subscribe((firstPageResult: Result) => {
          this.aggregations = firstPageResult.aggregations;
          this.aggregationsStore.update(firstPageResult.aggregations);
        })
    );

    // Trigger skeleton on search whether from input or from filters
    effect(() => {
      getState(this.queryParamsStore);
      this.articles.set(undefined);
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.aggregationsStore.clear();
  }

  onSort(sort: SortingChoice): void {
    this.queryParamsStore.patch({ sort: sort.name });

    this.articles.set(undefined);
    this.searchService.search([]);
  }

  toggleAssistant(): void {
    console.log("Toggle assistant");
    this.drawerStack.toggleAssistant();
  }

  streaming(state: boolean): void {
    this.isStreaming.set(state);
  }

  nextPage() {
    this.query.fetchNextPage();
  }
}
