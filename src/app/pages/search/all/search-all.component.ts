import { NavigationService } from '@/app/services/navigation.service';
import { QueryStoreService } from '@/app/services/query-store.service';
import { buildFirstPageQuery } from '@/app/services/query.service';
import { SearchService } from '@/app/services/search.service';
import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { ArticleDefaultSkeletonComponent } from '@mint/components/article/default-skeleton/article-default-skeleton.component';
import { ArticleDefaultComponent } from '@mint/components/article/default/article-default.component';
import { DrawerStackService } from '@mint/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@mint/components/filters/filters.component';
import { SelectArticleFromQueryParamsDirective } from '@mint/directives/select-article-from-query-params.directive';
import { SelectArticleOnClickDirective } from '@mint/directives/select-article-on-click.directive';
import { Article } from '@mint/types/articles/article.type';
import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Subscription, merge, switchMap, take } from 'rxjs';
import { aggregationsStore } from '../../../stores/aggregations.store';
import { filtersStore } from '../../../stores/filters.store';
import { searchInputStore } from '../../../stores/search-input.store';
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
    inputs: ['articleId: id']
  }]
})
export class SearchAllComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public readonly id = input<string | undefined>();

  protected readonly articles = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');

  private readonly navigationService = inject(NavigationService);
  private readonly queryStoreService = inject(QueryStoreService);
  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);

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
          switchMap(() => this.queryService.search(runInInjectionContext(this.injector, () => buildFirstPageQuery())))
        )
        .subscribe((firstPageResult: Result) => {
          aggregationsStore.set(firstPageResult.aggregations);
        })
    );

    this.subscription.add(
      this.searchService.result$.subscribe((result: Result) => {
        this.articles.set(result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'default' }))) ?? []);
        this.queryText.set(this.queryStoreService.query());
      })
    );

    // Trigger skeleton on search whether from input or from filters
    this.subscription.add(
      merge(searchInputStore.next$, filtersStore.current$)
        .subscribe(() => this.articles.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    aggregationsStore.clear();
  }
}
