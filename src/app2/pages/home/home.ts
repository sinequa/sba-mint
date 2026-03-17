import { Component, effect, Injector, inject, runInInjectionContext, signal } from "@angular/core";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { SearchWithAutocompleteComponent } from "@components/search/search-with-autocomplete";
import { WidgetsTabsComponent } from "@components/widgets/widgets-tabs";
import { provideTranslocoScope } from "@jsverse/transloco";
import { error, fetchQuery } from "@sinequa/atomic";
import { AggregationsStore, ApplicationService, AppStore, SelectionStore, signIn } from "@sinequa/atomic-angular";
import { KeyboardNavigatorOptions } from "@sinequa/ui";

@Component({
  selector: "app-home",
  template: `
  <div class="mt-4">
    <header>
      <img class="mx-auto mt-auto mb-8 w-64 content-[var(--logo-large)/var(--logo-alt-text)] md:mb-16" alt="logo" />
    </header>
    <div class="md:m-auto md:w-[80%]">
      <div class="mx-2 flex flex-col gap-16">
        <search-with-autocomplete />
        <widgets-tabs />
      </div>
    </div>
  </div>
  <sheet-previewer />
  `,
  imports: [SearchWithAutocompleteComponent, WidgetsTabsComponent, SheetPreviewerComponent],
  providers: [provideTranslocoScope("bookmarks", "searches", "collections")]
})
export class HomeComponent {
  readonly injector = inject(Injector);
  readonly appStore = inject(AppStore);
  readonly applicationService = inject(ApplicationService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly selectionStore = inject(SelectionStore);

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

  constructor() {
    // Set the page title to "Home" if no preview is open (i.e., no selection in the selection store)
    effect(() => {
      const id = this.selectionStore.id?.();
      if (!id) {
        this.applicationService.setTitle("Home");
      }
    });

    // this is needed to populate the aggregation with the sources as no query is sent to the server
    this.getFirstPageQuery().catch(err => {
      if (err.status === 401) {
        console.error("Unauthorized access - please check your credentials:", err);
      } else if (err.status === 404) {
        console.log("404 Not Found!");
      } else {
        console.log(`HTTP error: ${err.status}`);
      }
    });
  }

  async getFirstPageQuery() {
    try {
      const query = this.appStore.getDefaultQuery() || { name: "_default" };
      const response = await fetchQuery({ isFirstPage: true, name: query.name });
      this.aggregationStore.update(response.aggregations);
    } catch (err: any) {
      if (err.status === 401) {
        error("Unauthorized access - please check your credentials:", err);
        runInInjectionContext(this.injector, () => signIn()).catch(signInErr => {
          console.error("Sign-in failed:", signInErr);
        });
      } else if (err.status === 404) {
        console.log("404 Not Found!");
      } else {
        console.log(`HTTP error: ${err.status}`);
      }
    }
  }
}
