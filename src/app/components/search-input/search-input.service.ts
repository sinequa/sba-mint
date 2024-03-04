import { NavigationService } from '@/app/services/navigation.service';
import { searchInputStore } from '@/app/stores/search-input.store';
import { Injectable, OnDestroy, inject } from '@angular/core';
import { RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchInputService implements OnDestroy {
  private readonly navigation = inject(NavigationService);
  private readonly subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.navigation.navigationEnd$
        .subscribe((event: RouterEvent) =>
          searchInputStore.set(this.getQueryTextFromQueryParams(event.url.split('?')[1]))
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public getQueryTextFromQueryParams(queryParams: string): string {
    const encodedQueryText = queryParams?.split('&').find(value => value.startsWith('q='))?.split('=')?.[1] ?? '';
    const queryText = decodeURIComponent(encodedQueryText);

    return queryText;
  }
}
