import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { Subscription, distinctUntilChanged, switchMap, take } from 'rxjs';

import { Aggregation, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleDefaultSkeletonComponent } from '@/app/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@/app/components/article/default/article-default.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { SelectArticleFromQueryParamsDirective, SelectArticleOnClickDirective } from '@/app/directives';
import { NavigationService, SearchService } from '@/app/services';
import { queryParamsStore, searchInputStore } from '@/app/stores';
import { Article } from "@/app/types/articles";
import { QueryParams, buildFirstPageQuery } from '@/app/utils';
import { AggregationsStore } from '@/stores';

import { OverviewPeopleComponent } from '../../components/overview/people/overview-people.component';
import { OverviewSlidesComponent } from '../../components/overview/slides/overview-slides.component';

@Component({
  selector: 'app-search-all',
  standalone: true,
  imports: [SelectArticleOnClickDirective, FiltersComponent, OverviewPeopleComponent, OverviewSlidesComponent, ArticleDefaultComponent, ArticleDefaultSkeletonComponent],
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

  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');

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
    // Setup aggregations for filtering mechanism
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
      this.searchService.result$.subscribe((result: Result) => {
        this.articles.set(result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'default' }))) ?? []);
        this.queryText.set(searchInputStore.state ?? '');
      })
    );

    // Trigger skeleton on search whether from input or from filters
    this.subscription.add(
      queryParamsStore.current$
        .pipe(distinctUntilChanged((a, b) => this.areSearchQueryParamsEquals(a, b)))
        .subscribe(() => this.articles.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.aggregationsStore.clear();
  }

  /**
   * Returns whether the search `QueryParams` are equals according to:
   * - `path`
   * - `text`
   * - `filters`
   *
   * @param previous Previous state of the search `QueryParams`
   * @param current Current state of the search `QueryParams`
   * @returns `true` if the search `QueryParams` are equals according to
   * criteria, `false` otherwise
   */
  private areSearchQueryParamsEquals(previous: QueryParams | undefined, current: QueryParams | undefined): boolean {
    if (previous === current) return true;

    const prev = JSON.stringify({ path: previous?.path, text: previous?.text, filters: previous?.filters ?? [] });
    const curr = JSON.stringify({ path: current?.path, text: current?.text, filters: current?.filters ?? [] });

    return prev === curr;
  }
}
