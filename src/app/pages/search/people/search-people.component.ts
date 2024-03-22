import { Component, HostBinding, Injector, Input, OnDestroy, OnInit, effect, inject, runInInjectionContext, signal } from '@angular/core';
import { Subscription, map, merge, switchMap, take } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticlePersonSkeletonComponent } from '@/app/components/article/person-skeleton/article-person-skeleton.component';
import { ArticlePersonComponent } from '@/app/components/article/person/article-person.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { FiltersComponent } from '@/app/components/filters/filters.component';
import { NavigationService, SearchService } from '@/app/services';
import { queryParamsStore, searchInputStore } from '@/app/stores';
import { PersonArticle } from '@/app/types/articles';
import { buildFirstPageQuery } from '@/app/utils';
import { AggregationsStore } from '@/stores';

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
  private readonly queryService = inject(QueryService);
  private readonly searchService = inject(SearchService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly aggregationsStore = inject(AggregationsStore);

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
          this.aggregationsStore.update(firstPageResult.aggregations);
        })
    );

    this.subscription.add(
      this.searchService.result$.subscribe((result: Result) => {
        this.people.set(result.records?.map((article: PersonArticle) => (Object.assign(article, { value: article.title, type: 'person' }))) ?? []);
        this.queryText.set(searchInputStore.state ?? '');
      })
    );

    // Trigger skeleton on search whether from input of from filters
    this.subscription.add(
      merge(searchInputStore.next$, queryParamsStore.current$.pipe(map((queryParams) => queryParams?.filters ?? [])))
        .subscribe(() => this.people.set(undefined))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.aggregationsStore.clear();
  }

}
