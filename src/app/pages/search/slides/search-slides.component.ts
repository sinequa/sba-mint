import { Component, HostBinding, Injector, OnDestroy, OnInit, effect, inject, input, runInInjectionContext, signal } from '@angular/core';
import { getState } from '@ngrx/signals';
import { Subscription, switchMap, take } from 'rxjs';

import { Article, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleSlideSkeletonComponent } from '@/app/components/article/slide-skeleton/article-slide-skeleton.component';
import { ArticleSlideComponent } from '@/app/components/article/slide/article-slide.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { PageConfiguration, PagerComponent } from "@/app/components/pagination/pager.component";
import { DidYouMeanComponent } from '@/app/components/did-you-mean/did-you-mean.component';
import { SelectArticleFromQueryParamsDirective } from '@/app/directives';
import { NavigationService, SearchService } from '@/app/services';
import { AggregationsStore, QueryParamsStore, searchInputStore } from '@/app/stores';
import { buildFirstPageQuery } from '@/app/utils';

@Component({
  selector: 'app-search-slides',
  standalone: true,
  templateUrl: './search-slides.component.html',
  styleUrl: './search-slides.component.scss',
  hostDirectives: [{
    directive: SelectArticleFromQueryParamsDirective,
    inputs: ['articleId: id']
  }],
  imports: [FiltersComponent, ArticleSlideComponent, ArticleSlideSkeletonComponent, PagerComponent, DidYouMeanComponent]
})
export class SearchSlidesComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  public readonly id = input<string | undefined>();

  readonly result = signal<Result | undefined>(undefined);
  protected readonly slides = signal(undefined as Article[] | undefined);
  protected readonly queryText = signal<string>('');
  protected readonly pageConfiguration = signal<PageConfiguration>({ page: 1, rowCount: 0, pageSize: 10 });

  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);
  private readonly queryParamsStore = inject(QueryParamsStore);

  private readonly sub = new Subscription();

  constructor(private readonly injector: Injector) {
    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened = state)
    );

    effect(() => {
      getState(this.queryParamsStore);
      this.slides.set(undefined);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Setup aggregations for filtering mechanism
    this.sub.add(
      this.navigationService.navigationEnd$
        .pipe(
          take(1),
          switchMap(() => this.queryService.search(runInInjectionContext(this.injector, () => buildFirstPageQuery())))
        )
        .subscribe((firstPageResult: Result) => {
          this.aggregationsStore.update(firstPageResult.aggregations);
        })
    );

    this.sub.add(
      this.searchService.result$
        .subscribe((result: Result) => {
          this.result.set(result);
          const { page, pageSize, rowCount } = result;
          this.pageConfiguration.set({ page, pageSize, rowCount });
          this.slides.set(result.records?.map((article: Article) => (Object.assign(article, { value: article.title, type: 'slide' }))) ?? []);
          this.queryText.set(searchInputStore.state ?? '');
        })
    );

    // Trigger skeleton on search whether from input or from filters
    this.sub.add(
      searchInputStore.next$.subscribe(() => this.slides.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.aggregationsStore.clear();
  }
}