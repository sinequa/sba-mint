import { Injectable, Injector, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription, combineLatest, filter, switchMap } from 'rxjs';

import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';

import { isASearchRoute } from '@/app/app.routes';
import { NavigationService, } from '@/app/services';
import { aggregationsStore, filtersStore } from '@/app/stores';
import { buildQuery, translateFiltersToApiFilters } from '@/app/utils';
import { Filter } from '@/app/utils/models';

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
  route = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly queryService = inject(QueryService);

  private readonly subscription = new Subscription();

  private readonly _result = new Subject<Result>();
  public readonly result$ = this._result.asObservable();

  constructor(private readonly injector: Injector) {
    this.subscription.add(
      combineLatest([
        aggregationsStore.next$,
        this.navigationService.navigationEnd$
      ]).pipe(
        filter(([aggregations, routerEvent]) => !!aggregations && isASearchRoute(routerEvent.url)),
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
}
