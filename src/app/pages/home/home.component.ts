import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Type, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

import {
  AppStore,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  KeyboardNavigatorOptions,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent
} from '@sinequa/atomic-angular';

import { ActiveSuggestion, AutocompleteComponent } from '../../components/search-input/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu';
import { HorizontalDividerComponent } from '../../ui/divider/horizontal-divider';
import { TabComponent } from '../../ui/tabs/tab';
import { TabsComponent } from '../../ui/tabs/tabs';

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
    SearchInputComponent,
    AutocompleteComponent,
    UserMenuComponent,
    TabsComponent,
    TabComponent,
    AppSidebarComponent,
    HorizontalDividerComponent
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
  public drawerOpened: boolean = false;

  readonly autocomplete = viewChild<AutocompleteComponent>('autocomplete');

  readonly searchText = signal<string>('');

  readonly tabs = signal(homeFeatures);
  readonly activeDescendant = signal<ActiveSuggestion>(undefined);
  readonly selectedTabId = signal(0);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);

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

    this.drawerStack.isOpened.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => (this.drawerOpened = state));

    // when the component is destroyed, close all drawers
    this.destroyRef.onDestroy(() => this.drawerStack.closeAll());
  }

  public selectTab(tab: HomeTab): void {
    if (tab.disabled) return;

    const index = this.tabs().indexOf(tab);

    this.selectedTabId.set(index);
  }

  public search(text: string): void {
    this.router.navigate(['/search'], { queryParams: { q: text } });
  }

  selected(element: HTMLElement | null): void {
    this.search(element?.getAttribute('data-text') || this.searchText());
  }
}
