import { Component } from '@angular/core';

type SavedSearch = {
  label: string;
  filterCount?: number;
  date?: string;
}

@Component({
  selector: 'app-saved-searches',
  standalone: true,
  imports: [],
  templateUrl: './saved-searches.component.html',
  styleUrl: './saved-searches.component.scss'
})
export class SavedSearchesComponent {
  public savedSearches: SavedSearch[] = [
    { label: 'Sinequa', filterCount: 2, date: 'Today' },
    { label: 'Who is the best SaaS team member ?', date: 'Yesterday' },
    { label: 'Security processes', filterCount: 1, date: '8 days ago' },
    { label: 'Duis aute irure dolor in reprehenderit in voluptate', filterCount: 2, date: '15 days ago' },
    { label: 'Nemo enim ipsam voluptatem' },
    { label: 'Quis autem vel eum 1 filter' },
    {
      label: 'Duis aute irure dolor in reprehenderit in voluptate', filterCount: 2, date: '15 days ago'
    },
    { label: 'Nemo enim ipsam voluptatem' },
    { label: 'Quis autem vel eum', filterCount: 1 }
  ]

  public savedSearchClicked(savedSearch: SavedSearch): void {
    console.log(savedSearch);
  }
}
