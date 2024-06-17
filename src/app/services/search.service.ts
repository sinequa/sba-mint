import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';
import { Observable, Subject, catchError, of } from 'rxjs';

import { Query, Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { AggregationsStore, QueryParamsStore, UserSettingsStore } from '@/app/stores';
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';


export type SearchOptions = {
  appendFilters?: boolean;
}

type QueryParams = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
  t?: string; // tab name
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly router = inject(Router);
  private readonly queryService = inject(QueryService);

  private readonly _result = new Subject<Result>();
  public readonly result$ = this._result.asObservable();

  protected readonly aggregationsStore = inject(AggregationsStore);
  protected readonly queryParamsStore = inject(QueryParamsStore);
  protected readonly userSettingsStore = inject(UserSettingsStore);
  protected readonly injector = inject(Injector);


  public search(commands: string[], options: SearchOptions = { appendFilters: true }): void {
    const queryParams: QueryParams = {};
    const { filters = [], page, sort, tab } = getState(this.queryParamsStore);

    if (options.appendFilters) {
      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
      queryParams.t = tab;
    }

    this.router.navigate(commands, { queryParamsHandling: 'merge', queryParams });
  }

  /**
   * Retrieves the search result based on the current query.
   * @returns An Observable that emits the search result.
   */
  public getResult(): Observable<Result> {
    const query = this.getQuery();
    // add the query name to records, to have it available if we bookmark one
    return this.queryService.search(query).pipe(catchError(() => of({} as Result)));
  }

  /**
   * Retrieves the query object based on the current state of the queryParamsStore and aggregationsStore.
   * @returns The query object.
   */
  public getQuery(): Query {
    const { filters = [], sort, tab, text, queryName } = getState(this.queryParamsStore);
    const { aggregations } = getState(this.aggregationsStore);
    const translatedFilters = translateFiltersToApiFilters(filters, aggregations);
    const spellingCorrectionMode = getState(this.queryParamsStore).spellingCorrectionMode;
    const query = runInInjectionContext(this.injector, () => buildQuery({ filters: translatedFilters as any, name: queryName, sort, spellingCorrectionMode, tab, text }));
    return query;
  }

  /**
   * Navigates to the specified page and returns the search result.
   * @param page - The page number to navigate to.
   * @returns A promise that resolves to the search result.
   */
  public gotoPage(page: number) {
    this.queryParamsStore.patch({ page });
    this.search([]);
  }
}
