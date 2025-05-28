import { NgComponentOutlet } from '@angular/common';
import { Component, DestroyRef, Type, afterNextRender, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';

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

import { AutocompleteComponent } from '../../components/search-input/autocomplete/autocomplete.component';
import { SearchInputComponent } from '../../components/search-input/search-input.component';
import { UserMenuComponent } from '../../components/user-menu/user-menu';
import { AppSidebarComponent } from '../../components/sidebar/sidebar.component';

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
    label: 'recentSearches.label',
    inputs: { options: { itemsPerPage: 5 } },
    component: RecentSearchesComponent
  },
  {
    name: 'savedSearches',
    iconClass: 'fa-regular fa-star',
    label: 'savedSearches.label',
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
  imports: [NgComponentOutlet, TranslocoPipe, SearchInputComponent, AutocompleteComponent, UserMenuComponent, TabsComponent, TabComponent, AppSidebarComponent],
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
  providers: [provideTranslocoScope('bookmarks', 'saved-searches', 'recent-searches', 'collections')]
})
export class HomeComponent {
  public drawerOpened: boolean = false;

  readonly searchText = signal<string>('');

  readonly tabs = signal(homeFeatures);

  readonly selectedTabId = signal(0);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);

  readonly queryParamsStore = inject(QueryParamsStore);

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

  autocompleteItemClicked(item: Suggestion): void {
    if (!item.display) {
      console.error('No display property found on item', item);
      return;
    }

    this.search(item.display!);
  }
}
