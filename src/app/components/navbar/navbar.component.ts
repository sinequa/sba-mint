import { CommonModule } from '@angular/common';
import { Component, inject, signal, Type, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { debounceTime } from 'rxjs';

import { Suggestion } from '@sinequa/atomic';
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
  SavedSearchesService
} from '@sinequa/atomic-angular';
import { ButtonComponent, PopoverComponent, PopoverContentComponent } from '@sinequa/ui';

import { SearchInputComponent } from '../search-input/search-input.component';
import { AutocompleteComponent } from '../search-input/autocomplete/autocomplete.component';
import { UserMenuComponent } from '../user-menu/user-menu';

export type NavbarMenu = {
  display: string;
  iconClass: string;
  routerLink?: string;
  keepOnMouseLeave?: boolean;
  component?: Type<unknown>;
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    SearchInputComponent,
    AutocompleteComponent,
    UserMenuComponent,
    PopoverComponent,
    PopoverContentComponent
  ],
  host: {
    class: 'layout-search',
    '[attr.drawer-opened]': 'drawerOpened()'
  },
  styles: [
    `
      #logo {
        content: var(--logo-large) / var(--logo-large-alt-text);
      }
    `
  ]
})
export class NavbarComponent {
  readonly searchInput = viewChild(SearchInputComponent);
  readonly overflowManager = viewChild(OverflowManagerDirective);

  readonly drawerOpened = signal(false);
  readonly searchText = signal<string>('');

  protected readonly menus: NavbarMenu[] = [
    { display: 'Recent queries', iconClass: 'far fa-clock-rotate-left', routerLink: '/recent-searches', component: RecentSearchesComponent },
    { display: 'Bookmarks', iconClass: 'far fa-bookmark', component: BookmarksComponent },
    { display: 'Collections', iconClass: 'far fa-inbox', component: CollectionsComponent, keepOnMouseLeave: true },
    { display: 'Saved queries', iconClass: 'far fa-star', component: SavedSearchesComponent },
    { display: 'Alerts', iconClass: 'far fa-bell', component: AlertsComponent }
  ];

  private readonly transloco = inject(TranslocoService);
  private readonly drawerStack = inject(DrawerStackService);
  private readonly savedSearchesService = inject(SavedSearchesService);
  readonly router = inject(Router);
  readonly autocompleteService = inject(AutocompleteService);
  readonly queryParamsStore = inject(QueryParamsStore);

  constructor() {
    this.drawerStack.isOpened.pipe(takeUntilDestroyed()).subscribe(state => this.drawerOpened.set(state));

    // register to transloco events to update the overflow manager when translations are loaded
    // otherwise the overflow manager will count size of items without text
    this.transloco.events$.pipe(takeUntilDestroyed(), debounceTime(100)).subscribe(() => this.overflowManager()?.countItems());
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
