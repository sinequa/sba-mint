import { QueryStoreService } from '@/app/services/query-store.service';
import { FALLBACK_SEARCH_ROUTE, SearchService } from '@/app/services/search.service';
import { Component, Input, booleanAttribute, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { searchInputStore } from '../../stores/search-input.store';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss'
})
export class SearchInputComponent {
  @Input({ required: false, transform: booleanAttribute })
  public showSave!: boolean;

  public readonly input = inject(QueryStoreService).query;
  public readonly searchService = inject(SearchService);
  public inputDebounced = toSignal(toObservable(this.input).pipe(debounceTime(250)));

  private readonly router = inject(Router);

  protected executeSearch(): void {
    if (this.input() === '') return;

    const commands = this.searchService.isASearchRoute(this.router.url) ? [] : [FALLBACK_SEARCH_ROUTE];
    searchInputStore.set({ text: this.input() });

    this.router.navigate(commands, { queryParams: { q: this.input() } });
  }

  protected saveQuery(): void {
    console.log('save query');
  }

  protected clearInput(): void {
    this.input.set('');
    searchInputStore.set({ text: '' });
  }
}
