import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { SavedSearchesService } from '@/app/services/saved-searches.service';
import { UserSettingsService } from '@/app/services/user-settings.service';
import { SavedSearch as UserSettingsSavedSearch } from '@/app/types/articles/user-settings';
import { QueryParams, getQueryParamsFromUrl } from '@/app/utils/query-params';
import { NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StopPropagationDirective } from 'toolkit';

type SavedSearch = UserSettingsSavedSearch & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
}

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [NgClass, StopPropagationDirective, RelativeDatePipe],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss'
})
export class SavedSearchesComponent implements OnInit {
  protected readonly savedSearches = signal<SavedSearch[]>([]);

  private readonly router = inject(Router);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly savedSearchesService = inject(SavedSearchesService);

  ngOnInit(): void {
    this.savedSearchesService.getSavedSearches().then((savedSearches) => {
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
    });
  }

  public savedSearchClicked(savedSearch: SavedSearch): void {
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

    this.userSettingsService.patchUserSettings({ savedSearches: searches });
  }
}
