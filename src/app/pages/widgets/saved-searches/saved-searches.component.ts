import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { getQueryParamsFromUrl } from '@sinequa/atomic';
import { DrawerStackService, SavedSearchesService, SearchItem } from '@sinequa/atomic-angular';

@Component({
  selector: 'SavedSearches',
  imports: [TranslocoPipe],
  templateUrl: './saved-searches.component.html',
  host: {
    class: 'flex flex-col h-full w-full'
  }
})
export class SavedSearchesComponent {
  cdr = inject(ChangeDetectorRef);
  private readonly drawerStack = inject(DrawerStackService);

  private readonly router = inject(Router);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly drawerOpened = signal(false);
  protected readonly savedSearches = signal<SearchItem[]>([]);

  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));

    effect(() => {
      const savedSearches = this.savedSearchesService.getSavedSearches();

      this.savedSearches.set(
        (savedSearches || []).reduce((acc, savedSearch) => {
          const queryParams = getQueryParamsFromUrl(savedSearch.url);

          acc.push(
            Object.assign(savedSearch, {
              label: queryParams?.text || '',
              filterCount: queryParams?.filters?.length || 0,
              queryParams
            })
          );

          return acc;
        }, [] as SearchItem[])
      );
    });
  }

  public onClick(savedSearch: SearchItem): void {
    const queryParams = {
      q: savedSearch.queryParams?.text
    } as { q: string; f?: string };

    if (savedSearch.queryParams?.filters && savedSearch.queryParams?.filters?.length > 0) queryParams.f = JSON.stringify(savedSearch.queryParams?.filters);

    this.router.navigate([savedSearch.queryParams?.path], { queryParams });
  }

  public async onDelete(index: number) {
    await this.savedSearchesService.deleteSavedSearch(index);
    toast.success('Saved search removed', { duration: 2000 });
  }
}
