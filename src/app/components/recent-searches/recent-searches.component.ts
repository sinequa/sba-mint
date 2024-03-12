import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { RecentSearchesService } from '@/app/services';
import { RecentSearch as UserSettingsRecentSearch } from '@/app/types/articles/user-settings';
import { QueryParams, getQueryParamsFromUrl } from '@/app/utils/query-params';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

type RecentSearch = UserSettingsRecentSearch & {
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
export class RecentSearchesComponent implements OnInit {
  public recentSearches = signal<RecentSearch[] | undefined>(undefined);

  private readonly router = inject(Router);
  private readonly recentSearchesService = inject(RecentSearchesService);

  ngOnInit(): void {
    this.recentSearchesService.getRecentSearches().then((recentSearches) => {
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
        }, [] as RecentSearch[])
      );
    });
  }

  public recentSearchClicked(recentSearch: RecentSearch): void {
    const queryParams = {
      q: recentSearch.queryParams?.text
    } as { q: string, f?: string };

    if (recentSearch.queryParams?.filters && recentSearch.queryParams?.filters?.length > 0)
      queryParams.f = JSON.stringify(recentSearch.queryParams?.filters);

    this.router.navigate([recentSearch.queryParams?.path], { queryParams });
  }
}