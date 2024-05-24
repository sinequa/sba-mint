import { Component, Injector, OnDestroy, OnInit, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getState } from '@ngrx/signals';
import { EMPTY, Observable, Subscription, filter, map, switchMap } from 'rxjs';

import { Filter, Query, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { ArticleDefaultLightSkeletonComponent } from '@/app/components/article/default-light-skeleton/article-default-light-skeleton.component';
import { ArticleDefaultLightComponent } from '@/app/components/article/default-light/article-default-light.component';
import { ArticlePersonLightComponent } from '@/app/components/article/person-light/article-person-light.component';
import { AuthorAvatarComponent } from '@/app/components/author/author-avatar/author-avatar.component';
import { MockDataService } from '@/app/services';
import { AppStore, searchInputStore } from '@/app/stores';
import { Article, PersonArticle, getPersonIms, getPersonRecentContributionsQueryAndFilters, getPersonRelatedToQueryAndFilters } from "@/app/types/articles";
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { AggregationsStore } from '@/stores';

import { PEOPLE_QUERY_NAME } from '@/app/config/query-names';
import { PreviewNavbarComponent } from '../navbar/preview-navbar.component';

@Component({
  selector: 'app-preview-person',
  standalone: true,
  imports: [PreviewNavbarComponent, ArticlePersonLightComponent, ArticleDefaultLightComponent, ArticleDefaultLightSkeletonComponent, AuthorAvatarComponent],
  templateUrl: './preview-person.component.html',
  styleUrl: './preview-person.component.scss'
})
export class PreviewPersonComponent implements OnInit, OnDestroy {
  public readonly person = input.required<PersonArticle | undefined>({ alias: 'article' });

  protected readonly data = inject(MockDataService);
  protected readonly queryText = signal<string>('');

  protected readonly ims = computed(() => getPersonIms(this.person()));

  private readonly queryService = inject(QueryService);
  private readonly aggregationsStore = inject(AggregationsStore);
  private readonly appStore = inject(AppStore);

  private readonly person$ = toObservable(this.person);
  private readonly recentContributions$ = this.person$.pipe(
    switchMap((person) => this.getRecentContributions$(person)),
    map((result: Result) => result.records)
  );
  private readonly relatedTo$ = this.person$.pipe(
    switchMap((person) => this.getRelatedTo$(person)),
    map((result: Result) => result.records)
  );

  protected readonly manager = toSignal(
    this.person$.pipe(
      filter(person => !!person),
      switchMap((name) =>
        this.queryService.search(this.buildManagerQuery(name!))
          .pipe(
            map(result => (result.records?.[0] as PersonArticle)),
            filter(person => !!person),
            map(person => Object.assign(person, { type: 'person' }) as PersonArticle),
          )
      )
    )
  );

  private buildManagerQuery(author: PersonArticle): Query {
    return runInInjectionContext(this.injector, () => buildQuery({ name: PEOPLE_QUERY_NAME, pageSize: 1, filters:
      {
        field: 'id',
        value: author.collection[0] + '|' + author.employeeManagerId, // the ID is a combination of the mapping and the collection name
      } as Filter
    }));
  }

  protected readonly recentContributions = toSignal<Article[]>(this.recentContributions$);
  protected readonly relatedTo = toSignal<Article[]>(this.relatedTo$);

  private readonly subscription = new Subscription();

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.queryText.set(searchInputStore.state ?? '');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getRecentContributions$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRecentContributionsQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    const { aggregations } = getState(this.aggregationsStore);
    query.filters = translateFiltersToApiFilters(filters, aggregations) as Filter;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }

  private getRelatedTo$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRelatedToQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    const { aggregations } = getState(this.aggregationsStore);
    query.filters = translateFiltersToApiFilters(filters, aggregations) as Filter;

    query.globalRelevance = this.appStore.customizationJson()?.globalRelevanceOverride;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }
}
