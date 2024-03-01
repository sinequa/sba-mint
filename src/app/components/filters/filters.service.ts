import { NavigationService } from '@/app/services/navigation.service';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filtersStore } from '../../stores/filters.store';
import { Filter } from './filters.models';

@Injectable({
  providedIn: 'root'
})
export class FiltersService implements OnDestroy {
  private readonly navigation = inject(NavigationService);
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.navigation.navigationEnd$
        .subscribe((event: RouterEvent) => {
          filtersStore.set(this.getFiltersFromQueryParams(event.url.split('?')[1]));
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getFiltersFromQueryParams(queryParams: string): Filter[] {
    const encodedFilters = queryParams?.split('&').find(value => value.startsWith('f='))?.split('=')?.[1] ?? '[]';
    const filtersString = decodeURIComponent(encodedFilters);
    const filters = JSON.parse(filtersString ?? '[]');

    return filters;
  }
}
