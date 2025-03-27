import { NgComponentOutlet } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit, QueryList, Type, ViewChildren, effect, inject, signal } from '@angular/core';
import { EventType, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription, filter } from 'rxjs';

import { Suggestion } from '@sinequa/atomic';
import {
  AppStore,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent
} from '@sinequa/atomic-angular';
import { TabComponent, TabsComponent } from '@sinequa/ui';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { AutocompleteComponent } from '../../components/search-input/autocomplete/autocomplete.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu';

type HomeTab = {
  name: string;
  iconClass: string;
  label: string;
  component: Type<unknown>;
  inputs?: any;
  disabled?: boolean;
};

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
    component: BookmarksComponent
  },
  {
    name: 'baskets',
    iconClass: 'fa-regular fa-inbox',
    label: 'My collections',
    component: CollectionsComponent,
    inputs: { showButtons: false }
  }
];

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  host: {
    class: 'layout-search h-screen'
  },
  imports: [NgComponentOutlet, SearchInputComponent, AutocompleteComponent, UserMenuComponent, TabsComponent, TabComponent],
  styles: [
    `
      #logo {
        content: var(--logo-large) / var(--logo-large-alt-text);
      }
    `
  ]
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
    savedSearches: true
  };

  readonly translateService = inject(TranslocoService);

  constructor() {
    // react to tab changes
    effect(
      () => {
        this.selectedTabId.set(this.tabs().findIndex(tab => !tab.disabled));
      },
      { allowSignalWrites: true }
    );

    this.sub.add(this.drawerStack.isOpened.subscribe(state => (this.drawerOpened = state)));

    this.sub.add(
      // on navigation, close all tabs
      this.router.events.pipe(filter(event => event.type === EventType.NavigationStart)).subscribe(() => this.drawerStack.closeAll())
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

    this.search(item.display!);
  }
}
