import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { Subscription, distinctUntilChanged, switchMap, take } from 'rxjs';

import { Aggregation, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/app/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { PageConfiguration, PagerComponent } from '@/app/components/pagination/pager.component';
import { SelectArticleFromQueryParamsDirective, SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService, SearchService } from '@/app/services';
import { queryParamsStore, searchInputStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { areSearchQueryParamsEquals, buildFirstPageQuery } from '@/app/utils';
import { AggregationsStore } from '@/stores';

import { SortSelectorComponent, SortingChoice } from '@/app/components/sort-selector/sort-selector.component';
import { OverviewPeopleComponent } from '../../components/overview/people/overview-people.component';
import { OverviewSlidesComponent } from '../../components/overview/slides/overview-slides.component';

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [
    SelectArticleOnClickDirective,
    FiltersComponent,
    OverviewPeopleComponent,
    OverviewSlidesComponent,
    ArticleDefaultComponent,
    ArticleDefaultSkeletonComponent,
    PagerComponent,
    SortSelectorComponent
  ],
  templateUrl: './search-all.component.html',
  styleUrl: './search-all.component.scss',
  hostDirectives: [{
    directive: SelectArticleFromQueryParamsDirective,
    inputs: ['articleId: id', 'aggregations']
  }]
})
export class SearchAllComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public readonly id = input<string | undefined>();

  readonly result = signal<Result | undefined>(undefined);
  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');
  protected readonly pageConfiguration = signal<PageConfiguration>({ page: 1, rowCount: 0, pageSize: 10 });

  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);

  protected aggregations: Aggregation[];

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });
  private readonly subscription = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
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

    this.subscription.add(
      this.searchService.result$
        .subscribe((result: Result) => {
          const { page, pageSize, rowCount } = result;
          this.pageConfiguration.set({ page, pageSize, rowCount });
          console.log(result);
          this.result.set(result);
          this.articles.set(result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'default' }))) ?? []);
          this.queryText.set(searchInputStore.state ?? '');
        })
    );

    // Trigger skeleton on search whether from input or from filters
    this.subscription.add(
      queryParamsStore.current$
        .pipe(distinctUntilChanged((a, b) => areSearchQueryParamsEquals(a, b)))
        .subscribe(() => this.articles.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.aggregationsStore.clear();
  }

  onSort(sort: SortingChoice): void {
    console.log(sort);
  }
}
