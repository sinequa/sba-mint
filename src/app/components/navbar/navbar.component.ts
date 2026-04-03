import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal, Type, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { getState } from '@ngrx/signals';
import { debounceTime } from 'rxjs';

import {
  AlertsComponent,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  OverflowManagerDirective,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent,
  SearchItem
} from '@sinequa/atomic-angular';
import { ButtonComponent, cn, PopoverComponent, PopoverContentComponent } from '@sinequa/ui';
import { notify } from '@sinequa/atomic';

import { AutocompleteComponent } from '../search/autocomplete/autocomplete.component';
import { SearchComponent } from '../search/search.component';
import { UserMenuComponent } from '../user-menu/user-menu';

export type NavbarMenu = {
  display: string;
  iconClass: string;
  routerLink?: string;
  keepOnMouseLeave?: boolean;
  component?: Type<unknown>;
};

/**
 * Navbar component
 * Displays the top navigation bar with search input, user menu, and other navbar items
 * Uses the DrawerStackService to manage the state of the sidebar drawer
 *
 * @deprecated the new layout does not use this component anymore
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    CommonModule,
    RouterLink,
    TranslocoPipe,
    ButtonComponent,
    SearchComponent,
    AutocompleteComponent,
    UserMenuComponent,
    PopoverComponent,
    PopoverContentComponent
  ],
  host: {
    '[attr.drawer-opened]': 'drawerOpened()'
  },
  styles: [
    `
      :host {
        /* shift navbar to the left to account for the ml-8 gap of its parent */
        grid-template-columns: calc(25% - 32px) 25% 25% 25%;
      }
    `
  ]
})
export class NavbarComponent {
  cn = cn;
  readonly showInput = input<boolean>(true);
  readonly showMenu = input<boolean>(true);

  readonly searchInput = viewChild(SearchComponent);
  readonly overflowManager = viewChild(OverflowManagerDirective);
  readonly autocomplete = viewChild<AutocompleteComponent>('autocomplete');

  readonly drawerOpened = computed(() => this.drawerStack.isOpened());
  readonly searchText = signal<string>('');

  protected readonly menus = signal<NavbarMenu[]>([
    { display: 'searches.recent.label', iconClass: 'far fa-clock-rotate-left', routerLink: '/widgets/recent-searches', component: RecentSearchesComponent },
    { display: 'bookmarks.label', iconClass: 'far fa-bookmark', routerLink: '/widgets/bookmarks', component: BookmarksComponent },
    { display: 'collections.label', iconClass: 'far fa-inbox', routerLink: '/widgets/collections', component: CollectionsComponent },
    { display: 'searches.saved.label', iconClass: 'far fa-star', routerLink: '/widgets/saved-searches', component: SavedSearchesComponent },
    { display: 'alerts.label', iconClass: 'far fa-bell', component: AlertsComponent }
  ]);

  private readonly transloco = inject(TranslocoService);
  private readonly drawerStack = inject(DrawerStackService);
  readonly router = inject(Router);
  readonly autocompleteService = inject(AutocompleteService);
  readonly queryParamsStore = inject(QueryParamsStore);

  constructor() {
    // register to transloco events to update the overflow manager when translations are loaded
    // otherwise the overflow manager will count size of items without text
    this.transloco.events$.pipe(takeUntilDestroyed(), debounceTime(100)).subscribe(() => this.overflowManager()?.countItems());
  }

  protected search(text: string): void {
    this.queryParamsStore.patch({ text });

    const queryParams = this.queryParamsStore.getQueryParams();
    // Navigate to the search page or to the last path stored in the query params store
    const path = getState(this.queryParamsStore).path || '/search';
    this.router.navigate([path], { queryParams });
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
  protected saveSearch(savedSearch?: SearchItem): void {}

  /**
   * Occurs when the user selects a suggestion from the autocomplete.
   * @param element - The selected suggestion element.
   */
  protected selected(element: HTMLElement | null): void {
    // We should pass the focus somewhere else after selecting a suggestion
    this.search(element?.dataset['text'] || this.searchText());
  }
}
