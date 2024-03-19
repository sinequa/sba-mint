import { FALLBACK_SEARCH_ROUTE, isASearchRoute } from '@/app/app.routes';
import { NavigationService } from '@/app/services/navigation.service';
import { SavedSearchesService } from '@/app/services/saved-searches.service';
import { SearchService } from '@/app/services/search.service';
import { searchInputStore } from '@/app/stores/search-input.store';
import { AsyncPipe } from '@angular/common';
import { Component, HostBinding, ViewChild, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AutocompleteService } from '@/app/services/autocomplete.service';
import { DrawerStackService } from '../drawer-stack/drawer-stack.service';
import { AutocompleteComponent, Suggestion } from '../search-input/components/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../search-input/search-input.component';

type NavbarMenu = {
  label: string;
  iconClass: string;
};

type NavbarTab = {
  label: string;
  iconClass: string;
  routerLink: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [AsyncPipe, RouterModule, SearchInputComponent, AutocompleteComponent]
})
export class NavbarComponent {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @ViewChild(SearchInputComponent, { static: true }) public readonly searchInput: SearchInputComponent;

  protected readonly searchText = signal<string>('');

  protected readonly menus: NavbarMenu[] = [
    { label: 'Recent queries', iconClass: 'far fa-clock-rotate-left' },
    { label: 'Bookmarks', iconClass: 'far fa-star' },
    { label: 'Saved queries', iconClass: 'far fa-bookmark' },
    { label: 'Applications', iconClass: 'far fa-grid-round-2' }
  ];

  protected readonly tabs: NavbarTab[] = [
    { label: 'all results', routerLink: '/search/all', iconClass: 'far fa-globe' },
    { label: 'people', routerLink: '/search/people', iconClass: 'far fa-circle-user' },
    { label: 'slides', routerLink: '/search/slides', iconClass: 'far fa-presentation-screen' },
    { label: 'matters', routerLink: '/search/matters', iconClass: 'far fa-briefcase' },
  ];

  protected readonly navigationService = inject(NavigationService);

  private readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly searchService = inject(SearchService);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly autocompleteService = inject(AutocompleteService);

  private readonly subscriptions = new Subscription();

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });

  constructor() {
    this.subscriptions.add(
      searchInputStore.next$.subscribe(text => {
        this.searchInput.setInput(text);
      })
    );
  }

  autocompleteItemClicked(item: Suggestion): void {
    if (!item.display) {
      console.error('No display property found on item', item);
      return;
    }

    this.autocompleteService.opened.set(false);

    this.search(item.display!);
  }

  protected search(text: string): void {
    const commands = isASearchRoute(this.router.url) ? [] : [FALLBACK_SEARCH_ROUTE];

    searchInputStore.set(text);

    this.router.navigate(commands, { queryParams: { q: searchInputStore.state }, queryParamsHandling: 'merge' });

  }

  protected changeTab(tab: NavbarTab): void {
    this.drawerStack.closeAll();
    this.searchService.search([tab.routerLink]);
  }

  /**
   * Occurs when the search input is validated by the user
   * (e.g. by pressing enter or clicking on a search button)
   *
   * @param text The validated text
   */
  protected validated(text: string): void {
    this.search(text);
  }

  /**
   * Occurs when the search input is updated by the user and debounced by the system
   * @param text The debounced text
   */
  protected debounced(text: string): void {
    this.searchText.set(text);
  }

  /**
   * Occurs when the user clicks on the save button
   */
  protected saveSearch(): void {
    this.savedSearchesService.saveSearch();
  }
}
