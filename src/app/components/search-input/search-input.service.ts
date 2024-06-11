import { NavigationService } from '@/app/services/navigation.service';
import { searchInputStore } from '@/app/stores/search-input.store';
import { queryParamsFromUrl } from '@/app/utils';
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
        .subscribe((event: RouterEvent) => {
          const { q } = queryParamsFromUrl(event.url);
          searchInputStore.set(q);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
