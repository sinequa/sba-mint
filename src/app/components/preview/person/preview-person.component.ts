import { MockDataService } from '@/app/services/mock-data.service';
import { QueryStoreService } from '@/app/services/query-store.service';
import { buildQuery } from '@/app/services/query.service';
import { WpsAuthorImageComponent } from '@/app/wps-components/author-image/author-image.component';
import { Component, Injector, OnDestroy, OnInit, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ArticleDefaultLightSkeletonComponent } from '@mint/components/article/default-light-skeleton/article-default-light-skeleton.component';
import { ArticleDefaultLightComponent } from '@mint/components/article/default-light/article-default-light.component';
import { ArticlePersonLightComponent } from '@mint/components/article/person-light/article-person-light.component';
import { Article } from '@mint/types/articles/article.type';
import { PersonArticle, getPersonIms, getPersonRecentContributionsQueryAndFilters, getPersonRelatedToQueryAndFilters } from '@mint/types/articles/person.type';
import { Filter, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { EMPTY, Observable, Subscription, map, switchMap } from 'rxjs';
import { aggregationsStore } from '../../../stores/aggregations.store';
import { translateFiltersToApiFilters } from '../../../utils/api-filter-translator';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-person',
  standalone: true,
  imports: [PreviewNavbarComponent, ArticlePersonLightComponent, ArticleDefaultLightComponent, ArticleDefaultLightSkeletonComponent, WpsAuthorImageComponent],
  templateUrl: './preview-person.component.html',
  styleUrl: './preview-person.component.scss'
})
export class PreviewPersonComponent implements OnInit, OnDestroy {
  public readonly person = input.required<PersonArticle | undefined>({ alias: 'article' });

  protected readonly data = inject(MockDataService);
  protected readonly queryText = signal<string>('');

  protected readonly ims = computed(() => getPersonIms(this.person()));

  private readonly queryStoreService = inject(QueryStoreService);
  private readonly queryService = inject(QueryService);

  private readonly person$ = toObservable(this.person);
  private readonly recentContributions$ = this.person$.pipe(
    switchMap((person) => this.getRecentContributions$(person)),
    map((result: Result) => result.records)
  );
  private readonly relatedTo$ = this.person$.pipe(
    switchMap((person) => this.getRelatedTo$(person)),
    map((result: Result) => result.records)
  );

  protected readonly recentContributions = toSignal<Article[]>(this.recentContributions$);
  protected readonly relatedTo = toSignal<Article[]>(this.relatedTo$);

  private readonly subscription = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.queryText.set(this.queryStoreService.query());
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getRecentContributions$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRecentContributionsQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    query.filters = translateFiltersToApiFilters(filters, aggregationsStore.state) as Filter;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }

  private getRelatedTo$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRelatedToQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    query.filters = translateFiltersToApiFilters(filters, aggregationsStore.state) as Filter;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }
}
