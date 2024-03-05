import { NavigationService } from '@/app/services/navigation.service';
import { buildFirstPageQuery } from '@/app/services/query.service';
import { SearchService } from '@/app/services/search.service';
import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { ArticleSlideSkeletonComponent } from '@mint/components/article/slide-skeleton/article-slide-skeleton.component';
import { ArticleSlideComponent } from '@mint/components/article/slide/article-slide.component';
import { DrawerStackService } from '@mint/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@mint/components/filters/filters.component';
import { SelectArticleFromQueryParamsDirective } from '@mint/directives/select-article-from-query-params.directive';
import { Article, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Subscription, merge, switchMap, take } from 'rxjs';
import { aggregationsStore } from '../../../stores/aggregations.store';
import { filtersStore } from '../../../stores/filters.store';
import { searchInputStore } from '../../../stores/search-input.store';

@Component({
  selector: 'app-search-slides',
  standalone: true,
  imports: [FiltersComponent, ArticleSlideComponent, ArticleSlideSkeletonComponent],
  templateUrl: './search-slides.component.html',
  styleUrl: './search-slides.component.scss',
  hostDirectives: [{
    directive: SelectArticleFromQueryParamsDirective,
    inputs: ['articleId: id']
  }]
})
export class SearchSlidesComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public readonly id = input<string | undefined>();

  protected readonly slides = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');

  private readonly navigationService = inject(NavigationService);
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
        this.slides.set(result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'slide' }))) ?? []);
        this.queryText.set(searchInputStore.state ?? '');
      })
    );

    // Trigger skeleton on search whether from input or from filters
    this.subscription.add(
      merge(searchInputStore.next$, filtersStore.current$)
        .subscribe(() => this.slides.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    aggregationsStore.clear();
  }
}