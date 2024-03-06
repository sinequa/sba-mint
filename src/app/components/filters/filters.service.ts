import { NavigationService } from '@/app/services/navigation.service';
import { getFiltersFromQueryParams } from '@/app/utils/query-params';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filtersStore } from '../../stores/filters.store';

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
          filtersStore.set(getFiltersFromQueryParams(event.url.split('?')[1]));
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}