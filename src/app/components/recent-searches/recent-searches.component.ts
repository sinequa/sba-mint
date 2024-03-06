import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { QueryParams, getQueryParamsFromUrl } from '@/app/utils/query-params';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RecentSearch, UserSettings } from '@mint/types/articles/user-settings';
import { fetchUserSettings } from '@sinequa/atomic';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

type RecentSearchEx = RecentSearch & {
  label: string;
  filterCount?: number;
  date?: string;
  queryParams?: QueryParams;
}

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [FocusWithArrowKeysDirective, RelativeDatePipe],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.scss'
})
export class RecentSearchesComponent {
  public recentSearches = signal<RecentSearchEx[] | undefined>(undefined);

  private readonly router = inject(Router);

  constructor() {
    fetchUserSettings().then((settings: UserSettings) => {
      const recentSearches = settings.recentSearches || [];

      this.recentSearches.set(
        recentSearches.reduce((acc, recentSearch) => {
          const queryParams = getQueryParamsFromUrl(recentSearch.url);

          acc.push(
            Object.assign(recentSearch, {
              label: queryParams?.text || '',
              filterCount: queryParams?.filters?.length || 0,
              date: recentSearch.date,
              queryParams
            })
          );

          return acc;
        }, [] as RecentSearchEx[])
      );
    });
  }

  public recentSearchClicked(recentSearch: RecentSearchEx): void {
    const queryParams = {
      f: JSON.stringify(recentSearch.queryParams?.filters),
      q: recentSearch.queryParams?.text
    }

    this.router.navigate([recentSearch.queryParams?.path], { queryParams });
  }
}