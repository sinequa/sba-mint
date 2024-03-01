import { NgClass, NgComponentOutlet } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, Type, ViewChildren, signal } from '@angular/core';
import { ApplicationsComponent } from '@mint/components/applications/applications.component';
import { BookmarksComponent } from '@mint/components/bookmarks/bookmarks.component';
import { RecentSearchesComponent } from '@mint/components/recent-searches/recent-searches.component';
import { SavedSearchesComponent } from '@mint/components/saved-searches/saved-searches.component';
import { SearchInputComponent } from '@mint/components/search-input/search-input.component';
import { FocusWithArrowKeysDirective } from '@sinequa/atomic-angular';
import { filtersStore } from '../../stores/filters.store';

type HomeTab = {
  iconClass: string;
  label: string;
  component: Type<unknown>;
  disabled?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgClass, NgComponentOutlet, SearchInputComponent, FocusWithArrowKeysDirective, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChildren('componentContainer') public components!: QueryList<ElementRef>;

  public tabs: HomeTab[] = [
    {
      iconClass: 'fa-regular fa-clock-rotate-left',
      label: 'Recent searches',
      component: RecentSearchesComponent,
    },
    {
      iconClass: 'fa-regular fa-star',
      label: 'Saved searches',
      component: SavedSearchesComponent
    },
    {
      iconClass: 'fa-regular fa-bookmark',
      label: 'My bookmark',
      component: BookmarksComponent
    },
    {
      iconClass: 'fa-regular fa-grid-round-2',
      label: 'Applications',
      component: ApplicationsComponent
    }
  ];
  public selectedTabId = signal<number>(this.tabs.findIndex((tab) => !tab.disabled));

  ngOnInit(): void {
    filtersStore.clear();
  }

  public selectTab(tab: HomeTab): void {
    if (tab.disabled) return;

    const index = this.tabs.indexOf(tab);

    this.selectedTabId.set(index);
  }
}
