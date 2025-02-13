import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal, Type, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { debounceTime, Subscription } from 'rxjs';

import {
  AutocompleteService,
  DrawerStackService,
  DropdownComponent,
  NavigationService,
  OverflowItemDirective,
  OverflowManagerDirective,
  OverflowStopDirective,
  QueryParamsStore,
  SavedSearchesService
} from '@sinequa/atomic-angular';

import { BookmarksListComponent } from '@/core/features/bookmarks/list/bookmarks-list.component';
import { RecentSearchesComponent } from '@/core/features/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@/core/features/saved-searches/saved-searches.component';
import { UserMenuComponent } from '@/core/features/user-menu/user-menu';
import { SyslangPipe } from '@/core/pipes/syslang';

import { CollectionsComponent } from '@/core/features/collections/collections.component';
import { AutocompleteComponent, Suggestion } from '../search-input/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../search-input/search-input.component';

export type NavbarMenu = {
  display: string;
  iconClass: string;
  routerLink?: string;
  keepOnMouseLeave?: boolean;
  component?: Type<unknown>;
};

export type NavbarTab = {
  display: string;
  name: string;
  path: string;
  iconClass: string;
  routerLink: string;
  queryName?: string;
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    CommonModule,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    SearchInputComponent,
    AutocompleteComponent,
    UserMenuComponent,
    DropdownComponent,
    TranslocoPipe,
    SyslangPipe,
    OverflowManagerDirective,
    OverflowItemDirective,
    OverflowStopDirective
  ],
  host: {
    class: 'layout-search',
    '[attr.drawer-opened]': 'drawerOpened()'
  }
})
export class NavbarComponent implements OnDestroy {
  readonly searchInput = viewChild(SearchInputComponent);
  readonly overflowManager = viewChild(OverflowManagerDirective);

  readonly drawerOpened = signal(false);
  readonly searchText = signal<string>('');
  readonly visibleTabCount = signal<number | undefined>(undefined);

  protected readonly menus: NavbarMenu[] = [
    { display: 'Recent queries', iconClass: 'far fa-clock-rotate-left', routerLink: '/recent-searches', component: RecentSearchesComponent },
    { display: 'Bookmarks', iconClass: 'far fa-bookmark', component: BookmarksListComponent },
    { display: 'Collections', iconClass: 'far fa-inbox', component: CollectionsComponent, keepOnMouseLeave: true },
    { display: 'Saved queries', iconClass: 'far fa-star', component: SavedSearchesComponent }
  ];

  protected readonly navigationService = inject(NavigationService);

  private readonly transloco = inject(TranslocoService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly router = inject(Router);
  readonly autocompleteService = inject(AutocompleteService);
  readonly queryParamsStore = inject(QueryParamsStore);

  private readonly sub = new Subscription();

  // create tabs from the search routes
  readonly tabs = computed(
    () =>
      this.router.config
        .find(item => item.path === 'search')
        ?.children?.filter(c => c.path !== '**')
        .map(
          child =>
            ({
              display: child.data?.['display'] || child.path,
              name: child.data?.['wsQueryTab'] || child.path,
              path: child.path,
              routerLink: `${child.path}`,
              iconClass: child.data?.['iconClass'],
              queryName: child.data?.['queryName']
            }) as NavbarTab
        ) ?? []
  );
  readonly moreTabs = computed(() => this.tabs().slice(this.visibleTabCount()));

  constructor() {
    this.sub.add(this.drawerStack.isOpened.subscribe(state => this.drawerOpened.set(state)));

    // register to transloco events to update the overflow manager when translations are loaded
    // otherwise the overflow manager will count size of items without text
    this.sub.add(
      this.transloco.events$.pipe(debounceTime(100)).subscribe(() => {
        this.overflowManager()?.countItems();
      })
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
   *
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
