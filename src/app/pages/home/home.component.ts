import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Type, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import {
  AggregationsStore,
  AppStore,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  FiltersBarComponent,
  KeyboardNavigatorOptions,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent
} from '@sinequa/atomic-angular';
import { HorizontalDividerComponent, TabComponent, TabsComponent } from '@sinequa/ui';

import { ActiveSuggestion, AutocompleteComponent } from '../../components/search/autocomplete/autocomplete.component';
import { SearchComponent, SearchFooter } from '../../components/search/search.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu';
import { fetchQuery } from '@sinequa/atomic';
import { getState } from '@ngrx/signals';

type HomeTab = {
  name: string;
  iconClass: string;
  label: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  disabled?: boolean;
};

const homeFeatures: HomeTab[] = [
  {
    name: 'recentSearches',
    iconClass: 'fa-regular fa-clock-rotate-left',
    label: 'searches.recent.label',
    inputs: { options: { itemsPerPage: 5 } },
    component: RecentSearchesComponent
  },
  {
    name: 'savedSearches',
    iconClass: 'fa-regular fa-star',
    label: 'searches.saved.label',
    inputs: { options: { itemsPerPage: 5 } },
    component: SavedSearchesComponent
  },
  {
    name: 'bookmarks',
    iconClass: 'fa-regular fa-bookmark',
    label: 'bookmarks.label',
    inputs: { options: { itemsPerPage: 5 } },
    component: BookmarksComponent
  },
  {
    name: 'baskets',
    iconClass: 'fa-regular fa-inbox',
    label: 'collections.label',
    component: CollectionsComponent
  }
];

@Component({
  selector: 'app-home',
  imports: [
    NgComponentOutlet,
    TranslocoPipe,
    SearchComponent,
    SearchFooter,
    AutocompleteComponent,
    UserMenuComponent,
    TabsComponent,
    TabComponent,
    AppSidebarComponent,
    HorizontalDividerComponent,
    FiltersBarComponent
  ],
  templateUrl: './home.component.html',
  host: {
    class: 'layout-search h-screen',
    '[attr.drawer-opened]': 'drawerOpened'
  },
  styles: [
    `
      #logo {
        content: var(--logo-large) / var(--logo-alt-text);
      }
    `
  ],
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections')]
})
export class HomeComponent {
  public drawerOpened = computed(() => this.drawerStack.isOpened());

  readonly autocomplete = viewChild<AutocompleteComponent>('autocomplete');

  readonly searchText = signal<string>('');

  readonly tabs = signal(homeFeatures);
  readonly activeDescendant = signal<ActiveSuggestion>(undefined);
  readonly selectedTabId = signal(0);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);
  readonly aggregationStore = inject(AggregationsStore);

  readonly queryParamsStore = inject(QueryParamsStore);

  navigatorOptions = signal<KeyboardNavigatorOptions>({
    name: 'tabsNavigator',
    optionSelector: '[role="tab"]:not([aria-disabled="true"])',
    direction: 'horizontal',
    selectOnFocus: true,
    resetSelectionOnBlur: true
  });

  defaultUserFeatures = {
    bookmarks: true,
    recentSearches: true,
    savedSearches: true
  };

  constructor(private destroyRef: DestroyRef) {
    afterNextRender(() => {
      this.queryParamsStore.patch({ filters: [], text: '' });
    });

    // react to tab changes
    effect(() => {
      this.selectedTabId.set(this.tabs().findIndex(tab => !tab.disabled));
    });

    // when the component is destroyed, close all drawers
    this.destroyRef.onDestroy(() => this.drawerStack.closeAll());

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery();
  }

  async getFirstPageQuery() {
    const query = this.appStore.getDefaultQuery() || { name: '_default' };
    const response = await fetchQuery({ isFirstPage: true, name: query.name });
    this.aggregationStore.update(response.aggregations);
  }

  public selectTab(tab: HomeTab): void {
    if (tab.disabled) return;

    const index = this.tabs().indexOf(tab);

    this.selectedTabId.set(index);
  }

  public search(text: string): void {
    const { filters } = getState(this.queryParamsStore);
    this.router.navigate(['/search'], { queryParams: { q: text, f: JSON.stringify(filters) } });
  }

  selected(element: HTMLElement | null): void {
    this.search(element?.getAttribute('data-text') || this.searchText());
  }
}
