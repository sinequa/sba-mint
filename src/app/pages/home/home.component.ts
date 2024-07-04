import { NgClass, NgComponentOutlet } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit, QueryList, Type, ViewChildren, effect, inject, signal } from '@angular/core';
import { EventType, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Subscription, filter } from 'rxjs';

import { AppStore, AutocompleteService, DrawerStackService, FocusWithArrowKeysDirective, QueryParamsStore } from '@sinequa/atomic-angular';

import { AutocompleteComponent, Suggestion } from '@/core/components/search-input/autocomplete/autocomplete.component';
import { SearchInputComponent } from '@/core/components/search-input/search-input.component';
import { BookmarksListComponent } from '@/core/features/bookmarks/list/bookmarks-list.component';
import { RecentSearchesComponent } from '@/core/features/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@/core/features/saved-searches/saved-searches.component';
import { UserMenuComponent } from '@/core/features/user-menu/user-menu';


type HomeTab = {
  name: string;
  iconClass: string;
  label: string;
  component: Type<unknown>;
  disabled?: boolean;
}

const homeFeatures: HomeTab[] = [
  {
    name: 'recentSearches',
    iconClass: 'fa-regular fa-clock-rotate-left',
    label: 'Recent searches',
    component: RecentSearchesComponent
  },
  {
    name: 'savedSearches',
    iconClass: 'fa-regular fa-star',
    label: 'Saved searches',
    component: SavedSearchesComponent
  },
  {
    name: 'bookmarks',
    iconClass: 'fa-regular fa-bookmark',
    label: 'My bookmark',
    component: BookmarksListComponent
  }
];

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  host: {
    "class": "layout-search h-screen"
  },
  imports: [
    NgClass,
    NgComponentOutlet,
    SearchInputComponent,
    FocusWithArrowKeysDirective,
    AutocompleteComponent,
    UserMenuComponent,
    TranslocoPipe
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened') public drawerOpened: boolean = false;

  @ViewChildren(RecentSearchesComponent) widgets!: QueryList<RecentSearchesComponent[]>;

  readonly searchText = signal<string>('');

  readonly tabs = signal(homeFeatures);

  readonly selectedTabId = signal(0);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);

  readonly queryParamsStore = inject(QueryParamsStore);

  readonly sub = new Subscription();

  defaultUserFeatures = {
    bookmarks: true,
    recentSearches: true,
    savedSearches: true,
  }

  readonly translateService = inject(TranslocoService);

  constructor() {
    // react to tab changes
    effect(() => {
      this.selectedTabId.set(this.tabs().findIndex((tab) => !tab.disabled));
    }, { allowSignalWrites: true });

    this.sub.add(
      this.drawerStack.isOpened.subscribe(state => this.drawerOpened = state)
    );

    this.sub.add(
      // on navigation, close all tabs
      this.router.events
        .pipe(filter(event => event.type === EventType.NavigationStart))
        .subscribe(() => this.drawerStack.closeAll())
    );
  }

  ngOnInit(): void {
    this.queryParamsStore.patch({ filters: [] });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public selectTab(tab: HomeTab): void {
    if (tab.disabled) return;

    const index = this.tabs().indexOf(tab);

    this.selectedTabId.set(index);
  }

  public search(text: string): void {
    this.drawerStack.closeAll();
    this.router.navigate(['/search'], { queryParams: { q: text } });
  }

  autocompleteItemClicked(item: Suggestion): void {
    if (!item.display) {
      console.error('No display property found on item', item);
      return;
    }

    this.autocompleteService.opened.set(false);

    this.search(item.display!);
  }
}
