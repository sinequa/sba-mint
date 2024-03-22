import { Injectable, Injector, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';
import { Observable, Subject, Subscription, filter, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { isASearchRoute } from '@/app/app.routes';
import { NavigationService, } from '@/app/services';
import { queryParamsStore } from '@/app/stores/';
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { Filter } from '@/app/utils/models';
import { AggregationsStore } from '@/stores';


export type SearchOptions = {
  appendFilters?: boolean;
}

type QueryParams = {
  f?: string;
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

  public search(commands: string[], options: SearchOptions = { appendFilters: true }): void {
    const queryParams: QueryParams = {};

    if (options?.appendFilters && (queryParamsStore.state?.filters || [])?.length > 0)
      queryParams['f'] = JSON.stringify(queryParamsStore.state?.filters);
    else queryParams['f'] = undefined;

    this.router.navigate(commands, { queryParamsHandling: 'merge', queryParams });
  }

  public getResult(filters: Filter[]): Observable<Result> {
    const { aggregations } = getState(this.aggregationsStore);
    const translatedFilters = translateFiltersToApiFilters(filters, aggregations);
    const query = runInInjectionContext(this.injector, () => buildQuery({ filters: translatedFilters as any}));

    return this.queryService.search(query);
  }
}
