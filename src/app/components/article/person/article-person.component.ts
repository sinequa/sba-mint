import { QueryStoreService } from '@/app/services/query-store.service';
import { buildQuery } from '@/app/services/query.service';
import { Component, Injector, OnInit, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { SelectArticleOnClickDirective } from '@mint/directives/select-article-on-click.directive';
import { Article } from '@mint/types/articles/article.type';
import { PersonArticle, getPersonIms, getPersonRelatedToQueryAndFilters } from '@mint/types/articles/person.type';
import { Filter, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { EMPTY, Observable, map, switchMap } from 'rxjs';
import { StopPropagationDirective } from 'toolkit';
import { aggregationsStore } from '../../../stores/aggregations.store';
import { translateFiltersToApiFilters } from '../../../utils/api-filter-translator';
import { ArticleDefaultLightSkeletonComponent } from '../default-light-skeleton/article-default-light-skeleton.component';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

@Component({
  selector: 'app-article-person',
  standalone: true,
  imports: [StopPropagationDirective, ArticleDefaultLightComponent, ArticleDefaultLightSkeletonComponent],
  templateUrl: './article-person.component.html',
  styleUrl: './article-person.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: person']
  }]
})
export class ArticlePersonComponent implements OnInit {
  public readonly person = input.required<PersonArticle | Partial<PersonArticle> | undefined>();
  public readonly ims = computed(() => getPersonIms(this.person()));

  protected readonly queryText = signal<string>('');

  private readonly queryStoreService = inject(QueryStoreService);
  private readonly queryService = inject(QueryService);

  private readonly person$ = toObservable(this.person);
  private readonly relatedTo$ = this.person$.pipe(
    switchMap((person) => this.getRelatedTo$(person)),
    map((result: Result) => result.records)
  );
  protected readonly relatedTo = toSignal<Article[]>(this.relatedTo$);

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.queryText.set(this.queryStoreService.query());
  }

  private getRelatedTo$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRelatedToQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    query.filters = translateFiltersToApiFilters(filters, aggregationsStore.state) as Filter;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }
}
