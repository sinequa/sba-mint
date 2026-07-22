import { afterNextRender, Component, effect, Injector, inject, runInInjectionContext, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { SheetPreviewerComponent } from "@components/preview/sheet-previewer";
import { SearchWithAutocompleteComponent } from "@components/search/search-with-autocomplete";
import { WidgetsTabsComponent } from "@components/widgets/widgets-tabs";
import { provideTranslocoScope, TranslocoService } from "@jsverse/transloco";
import { error, fetchQuery } from "@sinequa/atomic";
import { AggregationsStore, ApplicationService, AppStore, FiltersBarComponent, SelectionStore, signIn } from "@sinequa/atomic-angular";
import { KeyboardNavigatorOptions } from "@sinequa/ui";

@Component({
  selector: "app-home",
  template: `
  <div>
    <header>
      <img fetchpriority=high loading=lazy class="mx-auto mt-auto mb-8 w-64 content-[var(--logo-large)/var(--logo-alt-text)] md:mb-16" alt="logo" />
    </header>
    <div class="md:m-auto md:w-[80%]">
      <div class="mx-2 flex flex-col gap-16">
        <div class="flex flex-col gap-4">
          <search-with-autocomplete />
          <filters-bar class="gap-1" homepage />
        </div>
        <widgets-tabs />
      </div>
    </div>
  </div>
  <sheet-previewer />
  `,
  imports: [SearchWithAutocompleteComponent, WidgetsTabsComponent, SheetPreviewerComponent, FiltersBarComponent],
  providers: [provideTranslocoScope("bookmarks", "searches", "collections")],
  host: {
    class: "block mt-16"
  }
})
export class HomeComponent {
  readonly injector = inject(Injector);
  readonly appStore = inject(AppStore);
  readonly applicationService = inject(ApplicationService);
  readonly aggregationStore = inject(AggregationsStore);
  readonly selectionStore = inject(SelectionStore);
  private readonly transloco = inject(TranslocoService);
  // Translated tab title via the service's selectTranslate — NOT the translateSignal helper, which
  // auto-injects any active provideTranslocoScope and would resolve the key in the wrong namespace.
  // selectTranslate waits for the async file (no raw-key flash) and re-emits on language change.
  private readonly pageTitle = toSignal(this.transloco.selectTranslate("pageTitle.home"));

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
    // Set the page title if no preview is open (i.e., no selection in the selection store).
    // Reading pageTitle() (a translated signal) re-runs this on language change so the title stays translated.
    effect(() => {
      const id = this.selectionStore.id?.();
      const title = this.pageTitle();
      if (!id && title) {
        this.applicationService.setTitle(title);
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
