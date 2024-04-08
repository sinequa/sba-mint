import { Injectable, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { NavigationService } from '@/app/services';
import { QueryParamsStore } from '@/app/stores';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService implements OnDestroy {
  private readonly navigationService = inject(NavigationService);
  private readonly queryParamsStore = inject(QueryParamsStore);

  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .subscribe(event => this.queryParamsStore.setFromUrl(event.url))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
