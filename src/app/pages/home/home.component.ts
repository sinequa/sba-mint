import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Injector, Type, afterNextRender, computed, effect, inject, runInInjectionContext, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import {
  AggregationsStore,
  AppStore,
  ApplicationService,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  KeyboardNavigatorOptions,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent,
  signIn
} from '@sinequa/atomic-angular';
import { Separator, TabComponent, TabContent, TabsComponent, TabsListComponent } from '@sinequa/ui';

import { getState } from '@ngrx/signals';
import { error, fetchQuery } from '@sinequa/atomic';
import { ActiveSuggestion, AutocompleteComponent } from '../../components/search/autocomplete/autocomplete.component';
import { SearchComponent } from '../../components/search/search.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu';

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
/**
 * Home page component that provides an interface for searching and accessing user features like bookmarks and recent searches.
 * It includes an autocomplete search bar, user menu, and tabs for different features.
 * @deprecated This component is deprecated and will be removed in future versions.
 */
@Component({
  selector: 'app-home',
  imports: [
    NgComponentOutlet,
    TranslocoPipe,
    SearchComponent,
    AutocompleteComponent,
    UserMenuComponent,
    TabsComponent,
    TabComponent,
    TabContent,
    AppSidebarComponent,
    TabsListComponent,
    Separator
  ],
  templateUrl: './home.component.html',
  host: {
    class: 'layout-search h-screen',
    '[attr.drawer-opened]': 'drawerOpened'
  },
  providers: [provideTranslocoScope('bookmarks', 'searches', 'collections')]
})
export class HomeComponent {
  public drawerOpened = computed(() => this.drawerStack.isOpened());

  readonly autocomplete = viewChild<AutocompleteComponent>('autocomplete');

  readonly searchText = signal<string>('');

  readonly tabs = signal(homeFeatures);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly injector = inject(Injector);
  readonly queryParamsStore = inject(QueryParamsStore);
  readonly applicationService = inject(ApplicationService);

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
      this.queryParamsStore.patch({ filters: [], text: undefined, tab: undefined });
    });

    // react to drawer state changes to update the application title when the drawer is closed
    effect(() => {
      if (!this.drawerOpened()) {
        this.applicationService.setTitle('Home');
      }
    });

    effect(() => {
      const state = getState(this.queryParamsStore);
      if (state.filters !== undefined && state.filters.length > 0) {
        this.search(this.searchText());
      }
    });

    // when the component is destroyed, close all drawers
    this.destroyRef.onDestroy(() => this.drawerStack.closeAll());

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery();
  }

  async getFirstPageQuery() {
    try {
      const query = this.appStore.getDefaultQuery() || { name: '_default' };
      const response = await fetchQuery({ isFirstPage: true, name: query.name });
      this.aggregationStore.update(response.aggregations);
    } catch (err: any) {
      if (err.status === 401) {
        error('Unauthorized access - please check your credentials:', err);
        runInInjectionContext(this.injector, () => signIn());
      } else if (err.status === 404) {
        console.log('404 Not Found!');
      } else {
        console.log(`HTTP error: ${err.status}`);
      }
    }
  }

  public search(text: string): void {
    const { filters } = getState(this.queryParamsStore);
    this.router.navigate(['/search'], { queryParams: { q: text, f: JSON.stringify(filters) } });
  }

  selected(element: HTMLElement | null): void {
    this.search(element?.getAttribute('data-text') || this.searchText());
  }
}
