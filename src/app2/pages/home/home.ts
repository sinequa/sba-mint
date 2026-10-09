import { afterNextRender, Component, computed, DestroyRef, effect, Injector, inject, runInInjectionContext, signal } from "@angular/core";
import { SearchWithAutocompleteComponent } from "@components/search/search-with-autocomplete";
import { SidebarMainComponent } from "@components/sidebar/sidebar";
import { WidgetsTabsComponent } from "@components/widgets/widgets-tabs";
import { provideTranslocoScope } from "@jsverse/transloco";
import { error, fetchQuery } from "@sinequa/atomic";
import {
  AggregationsStore,
  ApplicationService,
  AppStore,
  DrawerStackService,
  FiltersBarComponent,
  KeyboardNavigatorOptions,
  signIn
} from "@sinequa/atomic-angular";
import { SidebarProviderComponent, SidebarTriggerComponent } from "@sinequa/ui";

@Component({
  selector: "app-home",
  imports: [
    SidebarMainComponent,
    WidgetsTabsComponent,
    SearchWithAutocompleteComponent,
    SidebarTriggerComponent,
    SidebarProviderComponent,
    FiltersBarComponent
  ],
  templateUrl: "./home.html",
  host: {
    "[attr.drawer-opened]": "drawerOpened()"
  },
  providers: [provideTranslocoScope("bookmarks", "searches", "collections")]
})
export class HomeComponent {
  public drawerOpened = computed(() => this.drawerStack.isOpened());

  readonly appStore = inject(AppStore);
  readonly drawerStack = inject(DrawerStackService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly injector = inject(Injector);
  readonly applicationService = inject(ApplicationService);

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
    // react to drawer state changes to update the application title when the drawer is closed
    effect(() => {
      if (!this.drawerOpened()) {
        this.applicationService.setTitle("Home");
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
}
