import { AsyncPipe, CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, Type, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

import { AutocompleteService, DrawerStackService, DropdownComponent, NavigationService, QueryParamsStore, SavedSearchesService } from '@sinequa/atomic-angular';

import { BookmarksListComponent } from '@/core/features/bookmarks/list/bookmarks-list.component';
import { RecentSearchesComponent } from '@/core/features/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@/core/features/saved-searches/saved-searches.component';
import { UserMenuComponent } from '@/core/features/user-menu/user-menu';
import { SyslangPipe } from '@/core/pipes/syslang';

import { AutocompleteComponent, Suggestion } from '../search-input/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../search-input/search-input.component';

type NavbarMenu = {
  display: string;
  iconClass: string;
  component?: Type<unknown>;
};

type NavbarTab = {
  display: string;
  name: string;
  path: string;
  iconClass: string;
  routerLink: string;
  queryName?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    CommonModule,
    NgClass,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    SearchInputComponent,
    AutocompleteComponent,
    UserMenuComponent,
    DropdownComponent,
    TranslocoPipe,
    SyslangPipe
  ],
  host: {
    '[attr.drawer-opened]': 'drawerOpened()'
  }
})
export class NavbarComponent implements OnDestroy {
  readonly drawerOpened = signal(false);

  readonly searchInput = viewChild(SearchInputComponent);

  protected readonly searchText = signal<string>('');

  protected readonly menus: NavbarMenu[] = [
    { display: 'Recent queries', iconClass: 'far fa-clock-rotate-left', component: RecentSearchesComponent },
    { display: 'Bookmarks', iconClass: 'far fa-bookmark', component: BookmarksListComponent },
    { display: 'Saved queries', iconClass: 'far fa-star', component: SavedSearchesComponent }
  ];

  protected readonly navigationService = inject(NavigationService);

  private readonly router = inject(Router);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly autocompleteService = inject(AutocompleteService);
  readonly queryParamsStore = inject(QueryParamsStore);

  private readonly sub = new Subscription();

  // create tabs from the search routes
  protected readonly tabs: NavbarTab[] = this.router.config.find(item => item.path === "search")?.children?.filter(c => c.path !== "**")
    .map(child => ({
      display: child.data?.['display'] || child.path,
      name: child.data?.['wsQueryTab'] || child.path,
      path: child.path,
      routerLink: `${child.path}`,
      iconClass: child.data?.['iconClass'],
      queryName: child.data?.['queryName']
    }) as NavbarTab) ?? [];


  constructor() {
    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  autocompleteItemClicked(item: Suggestion): void {
    if (!item.display) {
      console.error('No display property found on item', item);
      return;
    }

    this.searchInput()?.closeAutocompletePopover();

    this.search(item.display!);
  }

  protected search(text: string): void {
    this.queryParamsStore.patch({ text });

    // ! we need to remove the page parameter from the query params when new search is performed
    this.router.navigate(['search'], { queryParams: { q: text, p: undefined }, queryParamsHandling: 'replace' });
  }

  protected changeTab(tab: NavbarTab): void {
    // we use the routerlink to navigate, so just close the drawer and remove the id parameter from the query params
    this.drawerStack.closeAll();
    this.queryParamsStore.patch({ id: undefined });
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
