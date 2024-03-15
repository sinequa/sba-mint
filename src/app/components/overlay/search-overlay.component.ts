import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SearchBarService } from './search-bar.service';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [],
  template: `
  <div class="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 mt-2">
    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
      @for(search of recentSearches(); track $index) {
        <li>
          <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ search }}</a>
        </li>
      }
    </ul>
</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchOverlayComponent {
  searchService = inject(SearchBarService);
  recentSearches = this.searchService.recentSearches;

}
