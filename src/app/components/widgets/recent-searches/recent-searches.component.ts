import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { RelativeDatePipe } from '@/app/pipes/relative-date.pipe';
import { RecentSearchesService } from '@/app/services';
import { RecentSearch } from '@/app/types';
import { QueryParams } from '@/app/utils';

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [FocusWithArrowKeysDirective, RelativeDatePipe],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.scss'
})
export class RecentSearchesComponent {

  private readonly router = inject(Router);
  private readonly recentSearchesService = inject(RecentSearchesService);

  public recentSearches = signal<RecentSearch[]>(this.recentSearchesService.getRecentSearches() || [])

  constructor() {  }

  onClick(recentSearch: RecentSearch): void {
    const { text, filters = [] } = recentSearch.queryParams || {} as QueryParams;

    const queryParams = {
      q: text,
      f: filters.length > 0 ? JSON.stringify(filters) : undefined
    };

    this.router.navigate([recentSearch.queryParams?.path], { queryParams });
  }

  onDelete(index: number, e: Event) {
    e.stopPropagation();
    const searches = this.recentSearches();

    if (searches) {
      searches?.splice(index, 1);
      this.recentSearches.set(searches);
      this.recentSearchesService.saveSearch(searches)
      toast.success('Recent search deleted');
    }
  }
}