import { Injectable, Injector, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription, filter, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { NavigationService, } from '@/app/services';
import { aggregationsStore } from '@/app/stores/aggregations.store';
import { filtersStore } from '@/app/stores/filters.store';
import { translateFiltersToApiFilters } from '@/app/utils';
import { Filter } from '@/app/utils/models';

import { buildQuery } from './query.service';

export type SearchOptions = {
  appendFilters?: boolean;
}

type QueryParams = {
  f?: string;
}

export const FALLBACK_SEARCH_ROUTE = '/search/all';
const SEARCH_ROUTES = ['/search'];

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {
  private readonly router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);

  private readonly subscription = new Subscription();

  private readonly _result = new Subject<Result>();
  public readonly result$ = this._result.asObservable();

  constructor(private readonly injector: Injector) {
    this.subscription.add(this.navigationService.navigationEnd$.pipe(
        filter((routerEvent) => this.isASearchRoute(routerEvent.url)),
        switchMap(() => this.getResult(filtersStore.state ?? []))
      ).subscribe((result: Result) => {
        this._result.next(result);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public search(commands: string[], options: SearchOptions = { appendFilters: true }): void {
    const queryParams: QueryParams = {};

    if (options?.appendFilters && (filtersStore.state || [])?.length > 0)
      queryParams['f'] = JSON.stringify(filtersStore.state);
    else queryParams['f'] = undefined;

    this.router.navigate(commands, { queryParamsHandling: 'merge', queryParams });
  }

  public getResult(filters: Filter[]): Observable<Result> {
    const translatedFilters = translateFiltersToApiFilters(filters, aggregationsStore.state);
    const query = runInInjectionContext(this.injector, () => buildQuery({ filters: translatedFilters as any }));

    return this.queryService.search(query);
  }

  public isASearchRoute(url: string): boolean {
    return SEARCH_ROUTES.some(route => url.startsWith(route));
  }
}
