import { Injectable, Injector, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';
import { Observable, Subject, Subscription, filter, map, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { isASearchRoute } from '@/app/app.routes';
import { NavigationService, } from '@/app/services';
import { queryParamsStore } from '@/app/stores/';
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { AggregationsStore } from '@/stores';
import { Article } from '../types';


export type SearchOptions = {
  appendFilters?: boolean;
}

type QueryParams = {
  f?: string; // filters list
  p?: number; // page number
  s?: string; // sort name
}

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);

  private readonly subscription = new Subscription();

  private readonly _result = new Subject<Result>();
  public readonly result$ = this._result.asObservable();

  protected readonly aggregationsStore = inject(AggregationsStore);

  constructor(private readonly injector: Injector) {
    this.subscription.add(
      this.navigationService.navigationEnd$
        .pipe(
          filter((routerEvent) => isASearchRoute(routerEvent.url)),
          switchMap(() => this.getResult(queryParamsStore.state?.filters ?? []))
        )
        .subscribe((result: Result) => {
          // Update the aggregations store with the new aggregations
          this.aggregationsStore.update(result.aggregations);
          this._result.next(result)
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Performs a search operation.
   * @param commands - The commands to navigate to after the search.
   * @param options - The search options.
   */
  public search(commands: string[], options: SearchOptions = { appendFilters: true }): void {
    const queryParams: QueryParams = {};
    const { filters = [], page, sort } = queryParamsStore.state || {};

    if (options.appendFilters) {
      queryParams.f = filters.length > 0 ? JSON.stringify(filters) : undefined;
      queryParams.p = page;
      queryParams.s = sort;
    }

    this.router.navigate(commands, { queryParamsHandling: 'merge', queryParams });
  }

  public getResult(filters: Filter[]): Observable<Result> {
    const { aggregations } = getState(this.aggregationsStore);
    const translatedFilters = translateFiltersToApiFilters(filters, aggregations);
    const sort = queryParamsStore.state?.sort;
    const query = runInInjectionContext(this.injector, () => buildQuery({ filters: translatedFilters as any, sort }));
    const queryName = query.name;
    // add the query name to records, to have it available if we bookmark one
    return this.queryService.search(query).pipe(map((result) => {
      (result.records as Article[]).forEach((record) => {
        record.$queryName = queryName;
        return record;
      });
      return result;
    }));
  }

  /**
   * Navigates to the specified page and returns the search result.
   * @param page - The page number to navigate to.
   * @returns A promise that resolves to the search result.
   */
  public gotoPage(page: number) {
    queryParamsStore.patch({ page });
    this.search([]);
  }
}
