import { NgTemplateOutlet } from '@angular/common';
import { Component, Injector, OnInit, computed, inject, input, runInInjectionContext, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { getState } from '@ngrx/signals';
import { EMPTY, Observable, map, switchMap } from 'rxjs';

import { Filter, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { StopPropagationDirective } from 'toolkit';

import { SelectArticleOnClickDirective } from '@/app/directives';
import { searchInputStore } from '@/app/stores';
import { Article, PersonArticle, getPersonIms, getPersonRelatedToQueryAndFilters } from "@/app/types/articles";
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { WpsAuthorImageComponent } from '@/app/wps-components/author-image/author-image.component';
import { AggregationsStore } from '@/stores';

import { ArticleDefaultLightSkeletonComponent } from '../default-light-skeleton/article-default-light-skeleton.component';
import { ArticleDefaultLightComponent } from '../default-light/article-default-light.component';

@Component({
  selector: 'app-article-person',
  standalone: true,
  imports: [NgTemplateOutlet, StopPropagationDirective, ArticleDefaultLightComponent, ArticleDefaultLightSkeletonComponent, WpsAuthorImageComponent],
  templateUrl: './article-person.component.html',
  styleUrl: './article-person.component.scss',
  hostDirectives: [{
    directive: SelectArticleOnClickDirective,
    inputs: ['article: person']
  }]
})
export class ArticlePersonComponent implements OnInit {
  public readonly person = input.required<PersonArticle | undefined>();
  public readonly ims = computed(() => getPersonIms(this.person()));

  protected readonly queryText = signal<string>('');

  private readonly queryService = inject(QueryService);
  private readonly aggregationsStore = inject(AggregationsStore);

  private readonly person$ = toObservable(this.person);
  private readonly relatedTo$ = this.person$.pipe(
    switchMap((person) => this.getRelatedTo$(person)),
    map((result: Result) => result.records)
  );
  protected readonly relatedTo = toSignal<Article[]>(this.relatedTo$);

  constructor(private readonly injector: Injector) { }

  ngOnInit(): void {
    this.queryText.set(searchInputStore.state ?? '');
  }

  private getRelatedTo$(person: PersonArticle | Partial<PersonArticle> | undefined): Observable<Result> {
    const [query, filters] = getPersonRelatedToQueryAndFilters(person) ?? [undefined, undefined];

    if (!query) return EMPTY;

    const { aggregations } = getState(this.aggregationsStore);
    query.filters = translateFiltersToApiFilters(filters, aggregations) as Filter;

    return this.queryService.search(runInInjectionContext(this.injector, () => buildQuery(query)));
  }
}
