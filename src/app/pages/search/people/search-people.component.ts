import { NavigationService } from '@/app/services/navigation.service';
import { QueryStoreService } from '@/app/services/query-store.service';
import { buildFirstPageQuery } from '@/app/services/query.service';
import { SearchService } from '@/app/services/search.service';
import { Component, HostBinding, Injector, Input, OnDestroy, OnInit, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { ArticlePersonSkeletonComponent } from '@mint/components/article/person-skeleton/article-person-skeleton.component';
import { ArticlePersonComponent } from '@mint/components/article/person/article-person.component';
import { DrawerStackService } from '@mint/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@mint/components/filters/filters.component';
import { PersonArticle } from '@mint/types/articles/person.type';
import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Subscription, merge, switchMap, take } from 'rxjs';
import { aggregationsStore } from '../../../stores/aggregations.store';
import { filtersStore } from '../../../stores/filters.store';
import { searchInputStore } from '../../../stores/search-input.store';

@Component({
  selector: 'app-search-people',
  standalone: true,
  imports: [FiltersComponent, ArticlePersonComponent, ArticlePersonSkeletonComponent],
  templateUrl: './search-people.component.html',
  styleUrl: './search-people.component.scss',
})
export class SearchPeopleComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @Input() public r: string | undefined;

  protected readonly people = signal(undefined as PersonArticle[] | undefined);
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
        this.people.set(result.records?.map((article: PersonArticle) => (Object.assign(article, { value: article.title, type: 'person' }))) ?? []);
        this.queryText.set(this.queryStoreService.query());
      })
    );

    // Trigger skeleton on search whether from input of from filters
    this.subscription.add(
      merge(searchInputStore.next$, filtersStore.current$)
        .subscribe(() => this.people.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    aggregationsStore.clear();
  }

}
