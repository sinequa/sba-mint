import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '@/app/components/navbar/navbar.component';
import { SelectionService } from '@/app/services';
import { searchInputStore } from '@/app/stores/search-input.store';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() public q: string | undefined;

  protected readonly selection = inject(SelectionService);

  ngOnInit(): void {
    searchInputStore.set(this.q ?? '');
  }

  ngOnDestroy(): void {
    searchInputStore.set('');
  }
}
