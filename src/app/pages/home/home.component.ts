import { NgComponentOutlet } from "@angular/common";
import { afterNextRender, Component, computed, DestroyRef, effect, Injector, inject, runInInjectionContext, signal, Type, viewChild } from "@angular/core";
import { Router } from "@angular/router";
import { provideTranslocoScope, translateSignal, TranslocoPipe } from "@jsverse/transloco";
import { getState } from "@ngrx/signals";
import { error, fetchQuery } from "@sinequa/atomic";
import {
  AggregationsStore,
  ApplicationService,
  AppStore,
  AutocompleteService,
  BookmarksComponent,
  CollectionsComponent,
  DrawerStackService,
  FiltersBarComponent,
  KeyboardNavigatorOptions,
  QueryParamsStore,
  RecentSearchesComponent,
  SavedSearchesComponent,
  signIn
} from "@sinequa/atomic-angular";
import { BookmarkIcon, HistoryIcon, InboxIcon, Separator, StarIcon, TabComponent, TabContent, TabsComponent, TabsListComponent } from "@sinequa/ui";
import { AutocompleteComponent } from "../../components/search/autocomplete/autocomplete.component";
import { SearchComponent } from "../../components/search/search.component";
import { AppSidebarComponent } from "../../components/sidebar/sidebar.component";
import { UserMenuComponent } from "../../components/user-menu/user-menu";

type HomeTab = {
  name: string;
  icon: Type<unknown>;
  label: string;
  component: Type<unknown>;
  inputs?: Record<string, unknown>;
  disabled?: boolean;
};

const homeFeatures: HomeTab[] = [
  {
    name: "recentSearches",
    icon: HistoryIcon,
    label: "searches.recent.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: RecentSearchesComponent
  },
  {
    name: "savedSearches",
    icon: StarIcon,
    label: "searches.saved.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: SavedSearchesComponent
  },
  {
    name: "bookmarks",
    icon: BookmarkIcon,
    label: "bookmarks.label",
    inputs: { options: { itemsPerPage: 5 } },
    component: BookmarksComponent
  },
  {
    name: "baskets",
    icon: InboxIcon,
    label: "collections.label",
    component: CollectionsComponent
  }
];
/**
 * Home page component that provides an interface for searching and accessing user features like bookmarks and recent searches.
 * It includes an autocomplete search bar, user menu, and tabs for different features.
 * @deprecated This component is deprecated and will be removed in future versions.
 */
@Component({
  selector: "app-home",
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
    FiltersBarComponent,
    TabsListComponent,
    Separator
  ],
  templateUrl: "./home.component.html",
  host: {
    class: "layout-search h-screen",
    "[attr.drawer-opened]": "drawerOpened"
  },
  providers: [provideTranslocoScope("bookmarks", "searches", "collections")]
})
export class HomeComponent {
  public drawerOpened = computed(() => this.drawerStack.isOpened());

  readonly autocomplete = viewChild<AutocompleteComponent>("autocomplete");

  readonly searchText = signal<string>("");

  readonly tabs = signal(homeFeatures);

  readonly autocompleteService = inject(AutocompleteService);
  readonly router = inject(Router);
  readonly appStore = inject(AppStore);
  readonly generalSettings = this.appStore.general();
  readonly drawerStack = inject(DrawerStackService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly injector = inject(Injector);
  readonly queryParamsStore = inject(QueryParamsStore);
  readonly applicationService = inject(ApplicationService);
  // Reactive translated title: empty string until the async translation file loads,
  // then re-emitted on every language change. translateSignal wraps selectTranslate,
  // so the raw key never flashes on first load. (Home route is not reused, so a reactive
  // effect is safe here.)
  private readonly pageTitle = translateSignal("pageTitle.home");

  readonly aggregations = computed(() => {
    const filters = this.appStore.filters().filter(f => f.homepage === true);
    return this.appStore.getAuthorized(filters);
  });

  readonly allowFilters = computed(() => {
    // by default, filters are not allowed on the homepage
    const { filters: { homepage = false } = {} } = this.generalSettings?.features || {};
    return homepage;
  });

  navigatorOptions = signal<KeyboardNavigatorOptions>({
    name: "tabsNavigator",
    optionSelector: '[role="tab"]:not([aria-disabled="true"])',
    direction: "horizontal",
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
      this.queryParamsStore.patch({ filters: [], text: undefined, tab: undefined, basket: undefined });
    });

    // react to drawer state changes to update the application title when the drawer is closed.
    // Reading pageTitle() (a translated signal) also re-runs this on language change.
    effect(() => {
      const title = this.pageTitle();
      if (!this.drawerOpened() && title) {
        this.applicationService.setTitle(title);
      }
    });

    // when the component is destroyed, close all drawers
    this.destroyRef.onDestroy(() => this.drawerStack.closeAll());

    // this is needed to populate the aggregation with the sources as no query is sent to the server.
    // Run it after the next render so the filters bar is already mounted when the aggregations
    // land in the store — otherwise a fast response could resolve before the component is mounted
    // and the filters would not show.
    afterNextRender(() => this.getFirstPageQuery());
  }

  async getFirstPageQuery() {
    try {
      const query = this.appStore.getDefaultQuery() || { name: "_default" };
      const response = await fetchQuery({ isFirstPage: true, name: query.name });
      this.aggregationStore.update(response.aggregations);
    } catch (err: any) {
      if (err.status === 401) {
        error("Unauthorized access - please check your credentials:", err);
        runInInjectionContext(this.injector, () => signIn());
      } else if (err.status === 404) {
        console.log("404 Not Found!");
      } else {
        console.log(`HTTP error: ${err.status}`);
      }
    }
  }

  public search(text: string): void {
    const { filters } = getState(this.queryParamsStore);
    this.router.navigate(["/search"], { queryParams: { q: text, f: JSON.stringify(filters) } });
  }

  selected(element: HTMLElement | null): void {
    this.search(element?.getAttribute("data-text") || this.searchText());
  }
}
