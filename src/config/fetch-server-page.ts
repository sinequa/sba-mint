import { inject, Injector, runInInjectionContext } from '@angular/core';
import { Article, Query, QueryParams, Result } from '@sinequa/atomic';
import { QueryService, SelectionService } from '@sinequa/atomic-angular';
import { lastValueFrom, map } from 'rxjs';

export function fetchServerPage(
  injector: Injector,
  offset: unknown = 1,
  {
    currentKeys,
    basket,
    id,
    q,
    tab,
    spellingCorrectionMode
  }: { currentKeys?: Partial<QueryParams>; basket?: string; id?: string; q: Query; tab?: string; spellingCorrectionMode?: string }
): Promise<Result> {
  // If the query is not defined, return an empty result
  if (currentKeys === undefined) return Promise.resolve({} as Result);

  return runInInjectionContext(injector, () => {
    const queryService = inject(QueryService);
    const selectionService = inject(SelectionService);

    const query = { ...q, page: offset, tab, basket, spellingCorrectionMode } as Query;

    return lastValueFrom(
      queryService.search(query).pipe(
        map(result => {
          result.records?.map((article: Article) => {
            return { ...article, value: article.title, type: 'default' };
          });
          return result;
        }),
        map(result => {
          // If the id is set, open the drawer with the preview of the article
          if (id) {
            result.records?.forEach(article => {
              if (article.id === id) {
                selectionService.setCurrentArticle(article);
              }
            });
          }
          return result;
        })
      )
    );
  });
}
