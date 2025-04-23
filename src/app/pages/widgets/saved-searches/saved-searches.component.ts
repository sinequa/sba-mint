import { ChangeDetectorRef, Component, effect, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

import { getQueryParamsFromUrl, QueryParams } from '@sinequa/atomic';
import { DrawerStackService, SavedSearchesService } from '@sinequa/atomic-angular';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { type SavedSearch as S } from '@sinequa/atomic-angular';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@sinequa/ui';
import { AppSidebarComponent } from '../../../components/sidebar/sidebar.component';

type SavedSearch = S & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
};

@Component({
  selector: 'SavedSearches',
  imports: [NavbarComponent, TranslocoPipe, PageHeaderComponent, AppSidebarComponent],
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
  protected readonly savedSearches = signal<SavedSearch[]>([]);

  private readonly sub = new Subscription();

  constructor() {
    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));

    effect(
      () => {
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
          }, [] as SavedSearch[])
        );
      },
      { allowSignalWrites: true }
    );
  }

  public onClick(savedSearch: SavedSearch): void {
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
