import { FALLBACK_SEARCH_ROUTE, isASearchRoute } from '@/app/app.routes';
import { NavigationService } from '@/app/services/navigation.service';
import { SavedSearchesService } from '@/app/services/saved-searches.service';
import { SearchService } from '@/app/services/search.service';
import { searchInputStore } from '@/app/stores/search-input.store';
import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { Component, HostBinding, Type, ViewChild, effect, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AutocompleteService } from '@/app/services/autocomplete.service';
import { QueryParamsStore } from '@/app/stores/query-params.store';

import { ApplicationsComponent } from '../applications/applications.component';
import { DrawerStackService } from '../drawer-stack/drawer-stack.service';
import { DropdownComponent } from '../dropdown/dropdown';
import { AutocompleteComponent, Suggestion } from '../search-input/components/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { BookmarksComponent } from '../widgets/bookmarks/bookmarks.component';
import { RecentSearchesComponent } from '../widgets/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '../widgets/saved-searches/saved-searches.component';
import { UserMenuComponent } from "./components/user-menu";

type NavbarMenu = {
  label: string;
  iconClass: string;
  component?: Type<unknown>;
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
    imports: [CommonModule, NgClass, AsyncPipe, RouterModule, SearchInputComponent, AutocompleteComponent, UserMenuComponent, DropdownComponent, ApplicationsComponent]
})
export class NavbarComponent {
  @HostBinding('attr.drawer-opened')
  public drawerOpened: boolean = false;

  @ViewChild(SearchInputComponent, { static: true }) public readonly searchInput: SearchInputComponent;

  protected readonly searchText = signal<string>('');

  protected readonly menus: NavbarMenu[] = [
    { label: 'Recent queries', iconClass: 'far fa-clock-rotate-left', component: RecentSearchesComponent },
    { label: 'Bookmarks', iconClass: 'far fa-bookmark', component: BookmarksComponent },
    { label: 'Saved queries', iconClass: 'far fa-star', component: SavedSearchesComponent },
    { label: 'Applications', iconClass: 'far fa-grid-round-2', component: ApplicationsComponent }
  ];

  // TODO: ici on peut faire quelque chose avec les "tabs" des "queries" définis dans l'admin
  protected readonly tabs: NavbarTab[] = [
    { label: 'all results', routerLink: '/search/all', iconClass: 'far fa-globe' }
  ];

  protected readonly navigationService = inject(NavigationService);

  private readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly searchService = inject(SearchService);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly autocompleteService = inject(AutocompleteService);
  readonly queryParamsStore = inject(QueryParamsStore);

  private readonly subscriptions = new Subscription();

  constructor() {

    effect(() => {
      this.drawerOpened = this.drawerStack.isOpened();
    });

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

    // ! we need to remove the page parameter from the query params when new search is performed
    this.router.navigate(commands, { queryParams: { q: searchInputStore.state, p: undefined }, queryParamsHandling: 'merge' });
  }

  protected changeTab(tab: NavbarTab): void {
    this.drawerStack.closeAll();
    // ! we need to remove the page parameter from the query params when new search is performed
    this.queryParamsStore.patch({ page: undefined });
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
