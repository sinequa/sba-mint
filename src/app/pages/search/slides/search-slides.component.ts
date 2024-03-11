import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { Subscription, merge, switchMap, take } from 'rxjs';

import { Article, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleSlideSkeletonComponent } from '@/app/components/article/slide-skeleton/article-slide-skeleton.component';
import { ArticleSlideComponent } from '@/app/components/article/slide/article-slide.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { SelectArticleFromQueryParamsDirective } from '@/app/directives';
import { NavigationService, SearchService, buildFirstPageQuery } from '@/app/services';
import { aggregationsStore } from '@/app/stores/aggregations.store';
import { filtersStore } from '@/app/stores/filters.store';
import { searchInputStore } from '@/app/stores/search-input.store';

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