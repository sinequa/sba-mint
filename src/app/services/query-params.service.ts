import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { NavigationService } from '@/app/services';
import { queryParamsStore } from '../stores/query-params.store';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private readonly navigationService = inject(NavigationService);

  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.navigationService.navigationEnd$
        .subscribe(event => queryParamsStore.setFromUrl(event.url))
    );
  }
}
