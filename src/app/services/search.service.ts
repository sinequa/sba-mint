import { Filter, translateFiltersToApiFilters } from '@/app/utils/api-filter-translator';
import { Injectable, Injector, OnDestroy, inject, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';
import { Result } from '@sinequa/atomic';
import { QueryService } from '@sinequa/atomic-angular';
import { Observable, Subject, Subscription, combineLatest, filter, switchMap } from 'rxjs';
import { isASearchRoute } from '../app.routes';
import { aggregationsStore } from '../stores/aggregations.store';
import { filtersStore } from '../stores/filters.store';
import { NavigationService } from './navigation.service';
import { buildQuery } from './query.service';

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

  constructor(private readonly injector: Injector) {
    this.subscription.add(
      combineLatest([
        aggregationsStore.next$,
        this.navigationService.navigationEnd$
      ]).pipe(
        filter(([aggregations, routerEvent]) => !!aggregations && isASearchRoute(routerEvent.url)),
        switchMap(() => this.getResult(filtersStore.state ?? []))
      ).subscribe((result) => {
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
