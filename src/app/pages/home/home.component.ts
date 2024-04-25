import { JsonPipe, NgClass, NgComponentOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, HostBinding, OnDestroy, OnInit, QueryList, Type, ViewChildren, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { ApplicationsComponent } from '@/app/components/applications/applications.component';
import { DrawerStackComponent } from '@/app/components/drawer-stack/drawer-stack.component';
import { DrawerStackService } from '@/app/components/drawer-stack/drawer-stack.service';
import { BackdropComponent } from '@/app/components/drawer/components/backdrop/backdrop.component';
import { AutocompleteComponent, Suggestion } from '@/app/components/search-input/components/autocomplete/autocomplete.component';
import { SearchInputComponent } from '@/app/components/search-input/search-input.component';
import { BookmarksComponent } from '@/app/components/widgets/bookmarks/bookmarks.component';
import { RecentSearchesComponent } from '@/app/components/widgets/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@/app/components/widgets/saved-searches/saved-searches.component';
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { AppStore, QueryParamsStore } from '@/app/stores';
import { Features, UserFeatures } from '@/app/types';

type HomeTab = {
  name: string;
  iconClass: string;
  label: string;
  component: Type<unknown>;
  disabled?: boolean;
}

const homeFeatures = [
  {
    name: 'recentSearches',
    iconClass: 'fa-regular fa-clock-rotate-left',
    label: 'Recent searches',
    component: RecentSearchesComponent,
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
    name: 'applications',
    iconClass: 'fa-regular fa-grid-round-2',
    label: 'Applications',
    component: ApplicationsComponent
  }
];

type FeaturesKeys = keyof UserFeatures | Features;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [NgClass, NgComponentOutlet, SearchInputComponent, FocusWithArrowKeysDirective, HttpClientModule, AutocompleteComponent, JsonPipe, DrawerStackComponent, BackdropComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
  @HostBinding('attr.drawer-opened') public drawerOpened: boolean = false;

  @ViewChildren('componentContainer') public components!: QueryList<ElementRef>;

  readonly searchText = signal<string>('');

  readonly tabs = computed(() => {
    const customJson = this.appStore.customizationJson();
    const features = { ...customJson?.userFeatures || this.defaultUserFeatures, ...customJson?.features, ...{ applications: true } };
    const enabledFeatures = homeFeatures.reduce((acc, feature) => {
      // add only if the feature is declared and set to true in the json
      if (feature.name in features && features[feature.name as keyof FeaturesKeys] === true) acc.push(feature);
      return acc;
    }, [] as HomeTab[]);
    return enabledFeatures;
  })

  readonly selectedTabId = signal(0);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  private readonly drawerStack = inject(DrawerStackService);

  readonly queryParamsStore = inject(QueryParamsStore);

  readonly subscription = new Subscription();

  defaultUserFeatures: UserFeatures = {
    bookmarks: true,
    recentSearches: true,
    savedSearches: true,
  }

  private drawerEffect = effect(() => {
    this.drawerOpened = this.drawerStack.isOpened();
  });

  constructor() {
    effect(() => {
      this.selectedTabId.set(this.tabs().findIndex((tab) => !tab.disabled));
    }, { allowSignalWrites: true })
  }

  ngOnInit(): void {
    this.queryParamsStore.patch({ filters: [] });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public selectTab(tab: HomeTab): void {
    if (tab.disabled) return;

    const index = this.tabs().indexOf(tab);

    this.selectedTabId.set(index);
  }

  public search(text: string): void {
    if (!text) return;

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
