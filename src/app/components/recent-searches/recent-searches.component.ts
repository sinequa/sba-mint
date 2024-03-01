import { Component } from '@angular/core';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

type RecentSearch = {
  label: string;
  filterCount?: number;
  date?: string;
}

@Component({
  selector: 'app-recent-searches',
  standalone: true,
  imports: [FocusWithArrowKeysDirective],
  templateUrl: './recent-searches.component.html',
  styleUrl: './recent-searches.component.scss'
})
export class RecentSearchesComponent {
  public recentSearches: RecentSearch[] = [
    { label: 'Duis aute irure dolor in reprehenderit in voluptate', filterCount: 2, date: '15 days ago' },
    { label: 'Security processes', filterCount: 1, date: '8 days ago' },
    { label: 'Nemo enim ipsam voluptatem' },
    { label: 'Nemo enim ipsam voluptatem' },
    { label: 'Quis autem vel eum', filterCount: 1 },
    { label: 'Sinequa', filterCount: 2, date: 'Today' },
    { label: 'Quis autem vel eum 1 filter' },
    {
      label: 'Duis aute irure dolor in reprehenderit in voluptate', filterCount: 2, date: '15 days ago'
    },
    { label: 'Who is the best SaaS team member ?', date: 'Yesterday' }
  ]

  public recentSearchClicked(recentSearch: RecentSearch): void {
    console.log(recentSearch);
  }
}

