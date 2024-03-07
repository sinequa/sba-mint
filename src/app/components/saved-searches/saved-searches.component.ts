import { QueryParams, getQueryParamsFromUrl } from '@/app/utils/query-params';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SavedSearch, UserSettings } from '@mint/types/articles/user-settings';
import { fetchUserSettings, patchUserSettings } from '@sinequa/atomic';
import { StopPropagationDirective } from 'toolkit';

type SavedSearchEx = SavedSearch & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
}

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [StopPropagationDirective],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss'
})
export class SavedSearchesComponent {
  public savedSearches = signal<SavedSearchEx[] | undefined>(undefined);

  private readonly router = inject(Router);

  constructor() {
    fetchUserSettings().then((settings: UserSettings) => {
      const savedSearches = settings.savedSearches || [];

      this.savedSearches.set(
        savedSearches.reduce((acc, savedSearch) => {
          const queryParams = getQueryParamsFromUrl(savedSearch.url);

          acc.push(
            Object.assign(savedSearch, {
              label: queryParams?.text || '',
              filterCount: queryParams?.filters?.length || 0,
              queryParams
            })
          );

          return acc;
        }, [] as SavedSearchEx[])
      );
    });
  }

  public savedSearchClicked(savedSearch: SavedSearchEx): void {
    const queryParams = {
      q: savedSearch.queryParams?.text
    } as { q: string, f?: string };

    if (savedSearch.queryParams?.filters && savedSearch.queryParams?.filters?.length > 0)
      queryParams.f = JSON.stringify(savedSearch.queryParams?.filters);

    this.router.navigate([savedSearch.queryParams?.path], { queryParams });
  }

  public removeSavedSearch(index: number): void {
    const searches = this.savedSearches();

    searches?.splice(index, 1);

    this.savedSearches.set(searches);

    patchUserSettings({ savedSearches: searches });
  }
}
