import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getState } from '@ngrx/signals';
import { QueryParamsStore } from '@sinequa/atomic-angular';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { SearchComponent } from './search.component';

/**
 * Search component with autocomplete functionality.
 * It captures user input and triggers search actions based on debounced input, validated input, or selected autocomplete suggestions.
 * - On debounced input, it updates the search text signal.
 * - On validated input (e.g., pressing Enter), it navigates to the search results page with the current search text and filters.
 * - On selecting an autocomplete suggestion, it navigates to the search results page with the selected text.
 *
 * Usage:
 * ```html
 * <app-search-with-autocomplete></app-search-with-autocomplete>
 * ```
 *
 */
@Component({
  selector: 'search-with-autocomplete',
  imports: [SearchComponent, AutocompleteComponent],
  template: `
    <app-search (debounced)="searchText.set($event)" (validated)="search($event)" (selected)="selected($event)">
      <app-autocomplete [text]="searchText()" />
    </app-search>
  `
})
export class SearchWithAutocompleteComponent {
  readonly queryParamsStore = inject(QueryParamsStore);
  readonly router = inject(Router);

  readonly searchText = signal<string>('');

  search(text: string): void {
    const { filters } = getState(this.queryParamsStore);
    this.router.navigate(['/search'], { queryParams: { q: text, f: JSON.stringify(filters) } });
  }

  selected(element: HTMLElement | null): void {
    this.search(element?.getAttribute('data-text') || this.searchText());
  }
}
