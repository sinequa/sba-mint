import { JsonPipe, NgClass, NgComponentOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, Type, ViewChildren, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';

import { ApplicationsComponent } from '@/app/components/applications/applications.component';
import { BookmarksComponent } from '@/app/components/bookmarks/bookmarks.component';
import { RecentSearchesComponent } from '@/app/components/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@/app/components/saved-searches/saved-searches.component';
import { AutocompleteComponent, Suggestion } from '@/app/components/search-input/components/autocomplete/autocomplete.component';
import { SearchInputComponent } from '@/app/components/search-input/search-input.component';
import { AutocompleteService } from '@/app/services/autocomplete.service';
import { appStore } from '@/app/stores';
import { queryParamsStore } from '@/app/stores/query-params.store';
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
  imports: [NgClass, NgComponentOutlet, SearchInputComponent, FocusWithArrowKeysDirective, HttpClientModule, AutocompleteComponent, JsonPipe]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChildren('componentContainer') public components!: QueryList<ElementRef>;

  readonly searchText = signal<string>('');

  readonly tabs = signal<HomeTab[]>([]);
  readonly selectedTabId = signal<number>(0);
  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly subscription = new Subscription();

  ngOnInit(): void {
    queryParamsStore.patch({ filters: [] });

    this.subscription.add(
      appStore.current$.pipe(filter(s => !!s)).subscribe(() => {
        const customJson = appStore.getCustomizationJson();
        const features = { ...customJson?.userFeatures, ...customJson?.features };
        const enabledFeatures = homeFeatures.reduce((acc, feature) => {
          // add only if the feature is declared and set to true in the json
          if (feature.name in features && features?.[feature.name as keyof FeaturesKeys] === true) acc.push(feature);
          return acc;
        }, [] as HomeTab[]);

        this.tabs.set(enabledFeatures);
        this.selectedTabId.set(enabledFeatures.findIndex((tab) => !tab.disabled));
      })
    )
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
